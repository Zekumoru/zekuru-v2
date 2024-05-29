import { ChannelType, Events, Message } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import cache from '../cache';
import buildLongContentEmbeds from '../commands/utilities/buildLongContentEmbeds';
import { appDebug } from '../utilities/logger';
import buildTranslationContextContent from '../translation/context/buildTranslationContextContent';

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;
    if (message.channelId !== '983305448151191552') return; // Dev Server's test channel

    const channel = message.guild?.channels.cache.get(message.channelId);
    if (!channel) return;
    if (channel.type !== ChannelType.GuildText) return;

    if (message.content === '') return;

    appDebug('start');
    const context = await buildTranslationContextContent(message, []);
    appDebug('end');

    const webhook = await cache.webhook.get(channel);
    webhook.send({
      username: message.member?.displayName ?? message.author.displayName,
      avatarURL:
        message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined,
      embeds: buildLongContentEmbeds('```' + context + '```'),
    });
  },
} as DiscordEvent;
