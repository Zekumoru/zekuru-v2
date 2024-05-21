import {
  ChannelType,
  DiscordAPIError,
  EmbedBuilder,
  Events,
  Message,
} from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import webhookCache from '../cache/webhookCache';
import { errorDebug } from '../utils/logger';
import buildLongContentEmbeds from '../commands/utilities/buildLongContentEmbeds';

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
