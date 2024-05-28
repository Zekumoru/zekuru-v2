import {
  ChannelType,
  Collection,
  EmbedBuilder,
  Events,
  Message,
  MessageType,
} from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import MessageLink, { IMessageLinkItem } from '../db/models/MessageLink';
import cache from '../cache';
import { codeLanguagesMap } from '../translation/languages';
import buildReplyEmbed from './translation/buildReplyEmbed';
import { Language } from 'deepl-node';
import buildEmbed from '../commands/utilities/buildEmbed';
import { errorDebug } from '../utilities/logger';
import addReplyPing from './translation/addReplyPing';
import {
  DISCORD_ATTACHMENT_SIZE_LIMIT,
  DISCORD_MESSAGE_CHARS_LIMIT,
} from './translation/limits';
import tagTranscoder from '../utilities/tagTranscoder';
import { AuthorizationError } from '../translation/error';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (!message.guildId) return;

    // ignore this bot's webhooks messages
    if (message.author.id !== message.client.user.id && message.webhookId) {
      const webhook = await message.fetchWebhook();
      if (webhook.owner?.id === message.client.user.id) return;
    }

    const sourceTrChannel = await cache.translateChannel.get(message.channelId);
    const link = await cache.channelLink.get(message.channelId);
    if (!sourceTrChannel || !link) return;

    const sourceLanguage = codeLanguagesMap.get(sourceTrChannel.languageCode);
    if (!sourceLanguage) {
      if (message.author.id === message.client.user.id) return; // ignore this bot
      message.reply({
        content: `Cannot translate, missing source language for language code \`${sourceTrChannel.languageCode}\`. Please contact the developer.`,
      });
      return;
    }

    // check if this bot has a translator
    const translator = await cache.translator.get(message.guildId);
    if (translator == null) {
      if (message.author.id === message.client.user.id) return; // ignore this bot
      message.reply({
        content: `Cannot translate, no api key found. Please sign in using the \`/sign-in\` command.`,
      });
      return;
    }

    // get valid target channels
    const targetChannels = await Promise.all(
      link.links.map(async ({ id: targetChannelId }) => {
        const channel = message.client.channels.cache.get(targetChannelId);
        if (!channel) return;
        if (channel.type !== ChannelType.GuildText) return;

        const webhook = await cache.webhook.get(channel);

        const targetTrChannel = await cache.translateChannel.get(channel.id);
        if (!targetTrChannel) return;

        return {
          trChannel: targetTrChannel,
          channel,
          webhook,
        };
      })
    );

    const username = message.member?.displayName ?? message.author.displayName;
    const avatarURL =
      message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined;

    const languages = targetChannels
      .map((targetChannel) => {
        if (!targetChannel) return;
        return codeLanguagesMap.get(targetChannel.trChannel.languageCode);
      })
      .filter(Boolean) as Language[];

    const repliesMap = new Collection<
      string,
      {
        embed: EmbedBuilder;
        message: Message;
        authorId: string | undefined;
      }
    >();

    let messages: (Message | undefined)[] | undefined;

    try {
      // check if message has reply
      if (message.reference) {
        await Promise.all(
          targetChannels.map(async (targetChannel) => {
            if (!targetChannel) return;
            const { channel } = targetChannel;
            const reply = await buildReplyEmbed(message, channel);
            if (!reply) return;

            repliesMap.set(channel.id, reply);
          })
        );
      }

      // used for handling sticker only message
      const sticker = message.stickers.map((sticker) => sticker)[0];
      // used for emoji only message
      const emojiTag = message.content.trim().match(/^<a?:[^<>]*:\d*>$/)?.[0];

      // check if message is a command reply
      if (
        message.type === MessageType.ChatInputCommand &&
        message.interaction &&
        message.guildId
      ) {
        const content = `Used`;
        const enLanguage = codeLanguagesMap.get('en')!;
        const results = await translator.translate({
          content,
          translatorType: 'deepl',
          contentLanguage: enLanguage,
          targetLanguages: languages,
        });
        messages = await Promise.all(
          targetChannels.map(async (targetChannel) => {
            if (!targetChannel) return;
            const { webhook, trChannel } = targetChannel;
            const language = codeLanguagesMap.get(trChannel.languageCode);
            if (!language) return;

            const translatedContent = results[language.name];
            if (!translatedContent) return;

            const author = message.interaction!.user;
            const member = message.guild?.members.cache.get(author.id);

            const replyEmbed = buildEmbed(
              member?.nickname ?? message.author.displayName,
              member?.avatarURL({ size: 32 }) ??
                author.displayAvatarURL({ size: 32 }),
              `${translatedContent}: \`/${message.interaction!.commandName}\``
            );

            return await webhook.send({
              username,
              avatarURL,
              embeds: [replyEmbed],
            });
          })
        );
      }
      // check if message is sticker only
      else if (sticker) {
        messages = await Promise.all(
          targetChannels.map(async (targetChannel) => {
            if (!targetChannel) return;
            const { webhook, channel } = targetChannel;
            const reply = repliesMap.get(channel.id);

            return await webhook.send({
              username,
              avatarURL,
              content: addReplyPing(
                `https://media.discordapp.net/stickers/${sticker.id}.webp`,
                reply?.authorId
              ),
              embeds: reply ? [reply.embed] : undefined,
            });
          })
        );
      }

      const emojisOnlyMap = new Collection<string, string>();

      // check if message is emoji only (and does not have reply)
      if (emojiTag && !message.reference) {
        targetChannels.forEach((targetChannel) => {
          if (!targetChannel) return;
          const { channel } = targetChannel;
          const [animRaw, _name, idRaw] = emojiTag.split(':');
          const emojiId = idRaw.slice(0, idRaw.length - 1);

          let content = message.content;
          // only swap emoji with image if the bot doesn't have it
          if (
            !message.client.emojis.cache.find((emoji) => emoji.id === emojiId)
          ) {
            const ext = animRaw[1] === 'a' ? 'gif' : 'png';
            content = `https://media.discordapp.net/emojis/${emojiId}.${ext}?size=48`;
          }

          emojisOnlyMap.set(channel.id, content);
        });
      }

      // handle sending messages, translating them if necessary
      if (!messages) {
        // build warnings strings
        const warningsStrBuilder: string[] = [];
        let results: { [key: string]: string | undefined } = {};

        // translate if not emoji-only
        if (emojisOnlyMap.size === 0) {
          // because Discord has 2K characters limit, trim it to 2K
          const userReachedLimit =
            message.content.length > DISCORD_MESSAGE_CHARS_LIMIT;

          if (userReachedLimit) {
            warningsStrBuilder.push(
              `**Warning:** You sent a message over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be translated.`
            );
          }

          const trimmedContent = userReachedLimit
            ? message.content.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
            : message.content;

          const [contentToTranslate, tagTable] =
            tagTranscoder.encode(trimmedContent);

          results = await translator.translate({
            content: contentToTranslate,
            contentLanguage: sourceLanguage,
            targetLanguages: languages,
            translatorType: 'deepl',
          });

          Object.keys(results).forEach((key) => {
            const translated = results[key];
            if (!translated) return;
            // REMEMBER: Trim the translated output later since it might have
            //           surpassed Discord's 2K characters limit
            results[key] = tagTranscoder.decode(translated, tagTable);
          });
        }

        messages = await Promise.all(
          targetChannels.map(async (targetChannel) => {
            if (!targetChannel) return;
            const { channel, trChannel, webhook } = targetChannel;
            const language = codeLanguagesMap.get(trChannel.languageCode);
            if (!language) return;

            let translatedContent: string | undefined;
            if (emojisOnlyMap.size > 0) {
              // content is an emoji
              translatedContent = emojisOnlyMap.get(channel.id);
            } else {
              const result = results[language.name];
              const botReachedLimit =
                !!result && result.length > DISCORD_MESSAGE_CHARS_LIMIT;

              translatedContent = botReachedLimit
                ? result.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
                : result;

              // notify user if the bot's translated message is over 2K
              if (botReachedLimit) {
                warningsStrBuilder.push(
                  `**Warning:** The translated message in <#${channel.id}> is over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be shown.`
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

            const reply = repliesMap.get(channel.id);
            const webhookMessage =
              translatedContent || attachments.length || reply
                ? await webhook.send({
                    username,
                    avatarURL,
                    content: addReplyPing(translatedContent, reply?.authorId),
                    files: attachments,
                    embeds: reply ? [reply.embed] : undefined,
                  })
                : undefined;

            // notify user if they sent a an attachment over 25 MB
            if (bigAttachmentCount) {
              warningsStrBuilder.push(
                `**Warning:** You sent ${
                  bigAttachmentCount === 1 ? `an attachment` : `attachments`
                } over 25MB (in <#${
                  message.channelId
                }>). Due to Discord's attachment size limit, ${
                  bigAttachmentCount === 1 ? `it` : `they`
                } won't be sent to other translate channels.`
              );
            }

            // Send warnings
            if (warningsStrBuilder.length) {
              await message.reply({
                content: warningsStrBuilder.join('\n'),
              });
            }

            return webhookMessage;
          })
        );
      }
    } catch (error) {
      if (error instanceof AuthorizationError) {
        await message.reply({
          content: `Cannot translate, invalid api key. Please check if you changed/disabled the api key then sign in again using the \`/sign-in\` command with a **valid** api key.`,
        });
      }
      errorDebug(error);
    }

    if (!messages) return;

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
