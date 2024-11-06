import { Events, Message } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import MessageLink, { IMessageLinkItem } from '../db/models/MessageLink';
import cache from '../cache';
import translateChannel from './translation/translateChannel';
import { errorDebug } from '../utilities/logger';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (!message.guildId) return;

    // check if the message comes from a translate channel otherwise ignore
    const sourceTrChannel = await cache.translateChannel.get(message.channelId);
    if (!sourceTrChannel) return;

    // ignore this bot's webhooks messages
    if (message.author.id !== message.client.user.id && message.webhookId) {
      try {
        const webhook = await message.fetchWebhook();
        if (webhook.owner?.id === message.client.user.id) return;
      } catch (_) {
        // ignore error because if the message.fetchWebhook throws an error
        // then that means that it's a user's application's message and
        // we also want to translate that
      }
    }

    const link = await cache.channelLink.get(message.channelId);
    if (!link) return;

    // check if this bot has a translator
    if ((await cache.translator.get(message.guildId)) == null) {
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
