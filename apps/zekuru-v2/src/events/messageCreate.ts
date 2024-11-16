import { ChannelType, Events, Message } from 'discord.js';
import buildLongContentEmbeds from '../commands/utilities/buildLongContentEmbeds';
import { webhook as webhookCache } from '@zekuru-v2/cache';
import { DiscordEvent } from '@zekuru-v2/types';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;
    if (message.channelId !== '983305448151191552') return; // Dev Server's test channel

    const channel = message.guild?.channels.cache.get(message.channelId);
    if (!channel) return;
    if (channel.type !== ChannelType.GuildText) return;

    if (message.content === '') return;

    const webhook = await webhookCache.get(channel);
    webhook.send({
      username: message.member?.displayName ?? message.author.displayName,
      avatarURL:
        message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined,
      embeds: buildLongContentEmbeds(message.content),
    });
  },
} as DiscordEvent;
