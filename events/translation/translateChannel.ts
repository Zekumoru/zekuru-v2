import { ChannelType, Message } from 'discord.js';
import cache from '../../cache';
import buildReplyEmbed from './buildReplyEmbed';
import buildCommandReplyEmbed from './buildCommandReplyEmbed';
import addReplyPing from './addReplyPing';
import translateContent from './translateContent';
import { DISCORD_ATTACHMENT_SIZE_LIMIT } from './limits';
import { AuthorizationError } from 'deepl-node';
import { errorDebug } from '../../utilities/logger';
import { ITranslateChannel } from '../../db/models/TranslateChannel';

const translateChannel = async (
  message: Message,
  channelId: string,
  sourceTrChannel: ITranslateChannel
) => {
  const channel = message.client.channels.cache.get(channelId);
  if (!channel) return;
  if (channel.type !== ChannelType.GuildText) return;

  const webhook = await cache.webhook.get(channel);

  const targetTrChannel = await cache.translateChannel.get(channel.id);
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
    const emojiTag = message.content.trim().match(/^<a?:[^<>]*:\d*>$/)?.[0];

    let translatedContent: string | undefined;
    if (emojiTag && reply === undefined) {
      const [animRaw, _name, idRaw] = emojiTag.split(':');
      const emojiId = idRaw.slice(0, idRaw.length - 1);

      // only swap emoji with image if the bot doesn't have it
      if (!message.client.emojis.cache.find((emoji) => emoji.id === emojiId)) {
        const ext = animRaw[1] === 'a' ? 'gif' : 'png';
        translatedContent = `https://media.discordapp.net/emojis/${emojiId}.${ext}?size=48`;
      } else {
        translatedContent = message.content;
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

export default translateChannel;
