import { ChannelType, Events, Message, TextChannel } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import MessageLink, { IMessageLinkItem } from '../db/models/MessageLink';
import cache from '../cache';
import { codeLanguagesMap } from '../translation/languages';
import handleCommandReplies from './translation/handleCommandReplies';
import handleStickerOnlyMessage from './translation/handleStickerOnlyMessage';
import handleMessageTranslation from './translation/handleMessageTranslation';
import buildRepliesMap from './translation/buildRepliesMap';
import { AuthorizationError, TranslatorError } from '../translation/error';
import { appDebug, errorDebug } from '../utilities/logger';

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
    console.time('onTranslate');
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
      if (error instanceof TranslatorError) {
        if (message.author.id === message.client.user.id) return; // ignore this bot
        await message.reply({
          content: error.message,
        });
      }
      errorDebug(error);
    }

    if (!messages) return;
    console.timeEnd('onTranslate');

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
