import { Channel, ChannelType } from 'discord.js';
import ChannelCache from '../../cache/ChannelCache';

const validateChannel = async (
  channel: Channel
): Promise<string | undefined> => {
  let warning: string | undefined;

  if (channel.type !== ChannelType.GuildText) {
    warning = `<#${channel.id}> must be a text channel.`;
  }

  if (!(await ChannelCache.has(channel.id))) {
    if (warning) {
      warning = `<#${channel.id}> must be a text channel and a translate channel.`;
    } else {
      warning = `<#${channel.id}> must be a translate channel.`;
    }
  }

  return warning;
};

export default validateChannel;
