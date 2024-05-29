import {
  ChannelType,
  Collection,
  EmbedBuilder,
  Events,
  Message,
  MessageType,
  TextChannel,
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
import buildRepliesMap from './translation/buildRepliesMap';
import handleCommandReplies from './translation/handleCommandReplies';
import getLanguagesFromTrChannels from './translation/getLanguagesFromTrChannels';
import handleStickerOnlyMessage from './translation/handleStickerOnlyMessage';
import buildEmojisOnlyMap from './translation/buildEmojisOnlyMap';
import handleMessageTranslation from './translation/handleMessageTranslation';

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
    const targetChannels = (
      await Promise.all(
        link.links.map(async ({ id: targetChannelId }) => {
          const channel = message.client.channels.cache.get(targetChannelId);
          if (!channel) return;
          if (channel.type !== ChannelType.GuildText) return;
          if (!cache.translateChannel.get(channel.id)) return;
          return channel;
        })
      )
    ).filter(Boolean) as TextChannel[];

    const targetTrChannels = await Promise.all(
      targetChannels.map(async (channel) => {
        return (await cache.translateChannel.get(channel.id))!;
      })
    );

    let messages: (Message | undefined)[] | undefined;

    try {
      const repliesMap = await buildRepliesMap(message, targetChannels);
      messages =
        (await handleCommandReplies(message, targetTrChannels)) ??
        (await handleStickerOnlyMessage(message, targetChannels, repliesMap)) ??
        (await handleMessageTranslation(
          message,
          sourceLanguage,
          targetTrChannels,
          repliesMap
        ));
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
