import { Events, Message } from 'discord.js';
import translateChannel from './translation/translateChannel';
import {
  translateChannel as translateChannelCache,
  channelLink as channelLinkCache,
  translator as translatorCache,
} from '@zekuru-v2/cache';
import { DiscordEvent, IMessageLinkItem } from '@zekuru-v2/types';
import { MessageLink } from '@zekuru-v2/db';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (!message.guildId) return;

    // check if the message comes from a translate channel otherwise ignore
    const sourceTrChannel = await translateChannelCache.get(message.channelId);
    if (!sourceTrChannel) return;

    // ignore this bot's webhooks messages
    if (message.author.id !== message.client.user.id && message.webhookId) {
      try {
        const webhook = await message.fetchWebhook();
        if (webhook.owner?.id === message.client.user.id) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // ignore error because if the message.fetchWebhook throws an error
        // then that means that it's a user's application's message and
        // we also want to translate that
      }
    }

    const link = await channelLinkCache.get(message.channelId);
    if (!link) return;

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
      messageId: m.id,
      channelId: m.channelId,
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
