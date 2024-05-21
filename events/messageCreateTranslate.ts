import {
  ChannelType,
  Events,
  Message,
  MessageType,
  TextChannel,
} from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import tagTranscoder from '../utils/tagTranscoder';
import translateChannels from '../cache/translateChannels';
import channelLinks from '../cache/channelLinks';
import webhookCache from '../cache/webhookCache';
import {
  AuthorizationError,
  SourceLanguageCode,
  TargetLanguageCode,
} from 'deepl-node';
import { errorDebug } from '../utils/logger';
import { ITranslateChannel } from '../models/TranslateChannel';
import MessageLink, {
  IMessageLink,
  IMessageLinkItem,
} from '../models/MessageLink';
import translatorCache from '../cache/translatorCache';
import { buildEmbed } from '../commands/utilities/buildLongContentEmbeds';

export const DISCORD_MESSAGE_CHARS_LIMIT = 2000;
export const DISCORD_ATTACHMENT_SIZE_LIMIT = 25 * 1024 * 1024; // 25 MB

export const translateContent = async (
  content: string,
  guildId: string,
  sourceLang: SourceLanguageCode,
  targetLang: TargetLanguageCode
) => {
  if (content.trim() === '') return;

  // because Discord has 2K characters limit, trim it to 2K
  const userReachedLimit = content.length > DISCORD_MESSAGE_CHARS_LIMIT;
  let toTranslate = userReachedLimit
    ? content.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
    : content;

  const [messageToTranslate, tagTable] = tagTranscoder.encode(toTranslate);

  const translator = await translatorCache.get(guildId);
  if (!translator) throw new AuthorizationError('Invalid api key');

  const translatedContentToDecode = (
    await translator.translateText(messageToTranslate, sourceLang, targetLang)
  ).text;

  const translatedContent = tagTranscoder.decode(
    translatedContentToDecode,
    tagTable
  );

  // check if the translated content reached limit
  const botReachedLimit =
    translatedContent.length > DISCORD_MESSAGE_CHARS_LIMIT;
  return {
    content: botReachedLimit
      ? translatedContent.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
      : translatedContent,
    userReachedLimit,
    botReachedLimit,
  };
};

const buildCommandReplyEmbed = async (
  message: Message,
  sourceLang: SourceLanguageCode,
  targetLang: TargetLanguageCode
) => {
  if (message.type !== MessageType.ChatInputCommand) return;
  if (!message.interaction) return;
  if (!message.guildId) return;

  const content = `Used:`;
  const translatedContent = await translateContent(
    content,
    message.guildId,
    sourceLang,
    targetLang
  );
  if (!translatedContent) return;

  const author = message.interaction.user;
  const member = message.guild?.members.cache.get(author.id);

  return {
    embed: buildEmbed(
      member?.nickname ?? message.author.displayName,
      member?.avatarURL({ size: 32 }) ?? author.displayAvatarURL({ size: 32 }),
      `${translatedContent.content} \`/${message.interaction.commandName}\``
    ),
    message: message,
  };
};

const buildReplyEmbed = async (message: Message, replyChannel: TextChannel) => {
  if (!message.reference) return;

  const channel = message.client.channels.cache.get(message.channelId);
  if (!channel) return;
  if (channel.type !== ChannelType.GuildText) return;

  const replyOriginalMessage = await message.fetchReference();
  if (!replyOriginalMessage) return;

  // get the reply message's links
  const messageLink = await MessageLink.findOne<IMessageLink>({
    links: {
      $elemMatch: {
        messageId: replyOriginalMessage.id,
        channelId: message.channelId,
      },
    },
  });
  if (!messageLink) return;

  // get the actual link to the reply message's language
  // meaning use this link for replying
  const link = messageLink.links.find(
    ({ channelId }) => channelId === replyChannel.id
  );
  if (!link) return;

  const replyMessage = await replyChannel.messages.fetch(link.messageId);

  // build content for the reply embed
  let replyContentRaw = replyMessage.content;
  if (replyContentRaw.length > 77)
    replyContentRaw = `${replyContentRaw.slice(0, 77)}...`;
  let replyContent = `**[Replying to:](${replyMessage.url})** ${replyContentRaw}`;

  if (replyContentRaw === '') {
    // check if replying to an attachment
    if (replyMessage.attachments.size) {
      replyContent = `**[Replying to an attachment](${replyMessage.url})** ${replyContentRaw}`;
    } else if (replyMessage.stickers.size) {
      replyContent = `**[Replying to a sticker](${replyMessage.url})**`;
    } else {
      // maybe will change in the future?
      // idk what other attachments there are other than embeds
      replyContent = `**[Replying to an attachment](${replyMessage.url})** ${replyContentRaw}`;
    }
  }

  return {
    embed: buildEmbed(
      replyMessage.member?.nickname ?? replyMessage.author.displayName,
      replyMessage.member?.avatarURL({ size: 32 }) ??
        replyMessage.author.displayAvatarURL({ size: 32 }),
      replyContent
    ),
    message: replyMessage,
  };
};

const addReplyPing = (
  content?: string,
  authorId?: string
): string | undefined => {
  // if there's no author id (meaning it's a bot) then don't ping
  if (!authorId) return content;

  // if content is empty
  if (!content) return `<@${authorId}>`;

  // do not add reply ping if there's already a ping on the user
  // INFO: pinging a user will ping the user on all channels, this is intended
  // therefore it's up to people using the bot to tell people not to ping unnecessarily
  if (content.includes(`<@${authorId}>`)) return content;

  return `${content} <@${authorId}>`;
};

const translateChannel = async (
  message: Message,
  channelId: string,
  sourceTrChannel: ITranslateChannel
) => {
  const channel = message.client.channels.cache.get(channelId);
  if (!channel) return;
  if (channel.type !== ChannelType.GuildText) return;

  const webhook = await webhookCache.get(channel);

  const targetTrChannel = await translateChannels.get(channel.id);
  if (!targetTrChannel) return;

  const username = message.member?.displayName ?? message.author.displayName;
  const avatarURL =
    message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined;

  try {
    // get reply embed
    const reply =
      (await buildReplyEmbed(message, channel)) ??
      (await buildCommandReplyEmbed(
        message,
        sourceTrChannel.sourceLang,
        targetTrChannel.targetLang
      ));
    const replyAuthorId = !reply?.message.author.bot
      ? reply?.message.author.id
      : undefined;

    // handle sticker-only message
    const sticker = message.stickers.map((sticker) => sticker)[0];
    if (sticker) {
      return await webhook.send({
        username,
        avatarURL,
        content: addReplyPing(
          `https://media.discordapp.net/stickers/${sticker.id}.webp`,
          replyAuthorId
        ),
        embeds: reply ? [reply.embed] : undefined,
      });
    }

    // check if content only contains a single emoji, convert to link
    // emoji syntax: <a?:name:12345678901234567890>
    const emojiTag = message.content.trim().match(/^<a?:.*:\d*>$/)?.[0];

    let translatedContent: string | undefined;
    if (emojiTag && reply === undefined) {
      const [animRaw, _name, idRaw] = emojiTag.split(':');
      const emojiId = idRaw.slice(0, idRaw.length - 1);

      // only swap emoji with image if the bot doesn't have it
      if (!message.client.emojis.cache.find((emoji) => emoji.id === emojiId)) {
        const ext = animRaw[1] === 'a' ? 'gif' : 'png';
        translatedContent = `https://media.discordapp.net/emojis/${emojiId}.${ext}?size=48`;
      }
    }

    // build warnings strings
    const strBuilder: string[] = [];
    if (translatedContent === undefined) {
      const translatedData = await translateContent(
        message.content,
        message.guildId!,
        sourceTrChannel.sourceLang,
        targetTrChannel.targetLang
      );
      translatedContent = translatedData?.content;

      // notify user if they sent a message over 2K
      if (translatedData?.userReachedLimit) {
        strBuilder.push(
          `**Warning:** You sent a message over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be translated.`
        );
      }

      // notify user if the bot's translated message is over 2K
      if (translatedData?.botReachedLimit) {
        strBuilder.push(
          `**Warning:** The translated message in <#${channelId}> is over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be shown.`
        );
      }
    }

    let bigAttachmentCount = 0;
    const attachments = message.attachments
      .map((attachment) => attachment)
      .filter((attachment) => {
        if (attachment.size > DISCORD_ATTACHMENT_SIZE_LIMIT) {
          bigAttachmentCount++;
          return false; // don't include it for sending to other translate channels
        }
        return true;
      });

    const webhookMessage =
      translatedContent || attachments.length || reply
        ? await webhook.send({
            username,
            avatarURL,
            content: addReplyPing(translatedContent, replyAuthorId),
            files: attachments,
            embeds: reply ? [reply.embed] : undefined,
          })
        : undefined;

    // notify user if they sent a an attachment over 25 MB
    if (bigAttachmentCount) {
      strBuilder.push(
        `**Warning:** You sent ${
          bigAttachmentCount === 1 ? `an attachment` : `attachments`
        } over 25MB (in <#${
          message.channelId
        }>). Due to Discord's attachment size limit, ${
          bigAttachmentCount === 1 ? `it` : `they`
        } won't be sent to other translate channels.`
      );
    }

    if (strBuilder.length) {
      await message.reply({
        content: strBuilder.join('\n'),
      });
    }

    return webhookMessage;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      await message.reply({
        content: `Cannot translate, invalid Deepl api key. Please check if you changed/disabled the api key then sign in again using the \`/sign-in\` command with a **valid** Deepl api key.`,
      });
    }
    errorDebug(error);
  }
};

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (!message.guildId) return;

    // ignore this bot's webhooks messages
    if (message.author.id !== message.client.user.id && message.webhookId) {
      const webhook = await message.fetchWebhook();
      if (webhook.owner?.id === message.client.user.id) return;
    }

    const sourceTrChannel = await translateChannels.get(message.channelId);
    const link = await channelLinks.get(message.channelId);
    if (!sourceTrChannel || !link) return;

    // check if this bot has a translator
    if ((await translatorCache.get(message.guildId)) == null) {
      if (message.author.id === message.client.user.id) return; // ignore this bot
      message.reply({
        content: `Cannot translate, no api key found. Please sign in using the \`/sign-in\` command.`,
      });
      return;
    }

    const messages = await Promise.all(
      link.links.map(async ({ id: channelId }) =>
        translateChannel(message, channelId, sourceTrChannel)
      )
    );

    const messagesIds = messages.filter(Boolean).map<IMessageLinkItem>((m) => ({
      messageId: m!.id,
      channelId: m!.channelId,
    }));
    messagesIds.push({
      messageId: message.id,
      channelId: message.channelId,
    });

    // save messages to db
    const messageLink = new MessageLink({
      authorId: message.author.id,
      messageId: message.id,
      channelId: message.channelId,
      links: messagesIds,
    });
    await messageLink.save();
  },
} as DiscordEvent;
