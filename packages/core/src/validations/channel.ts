import { Validator } from './validators';
import { Channel, ChannelType } from 'discord.js';
import { ChannelCacheRepository } from '@zekuru-v2/repositories';

export type ChannelValidatorContext = {
  cacheRepo: ChannelCacheRepository;
};

export type ChannelValidator = Validator<Channel, ChannelValidatorContext>;

export const isTextChannelValidator: ChannelValidator = async (channel) => {
  if (channel.type !== ChannelType.GuildText) {
    return 'must be a Discord text channel';
  }

  return null;
};

export const isTranslateChannelValidator: ChannelValidator = async (
  channel,
  ctx,
) => {
  if (await ctx.cacheRepo.has(channel.id)) {
    return null;
  }

  return 'must be a translate channel';
};

export const isLinkLimitReachedValidator: ChannelValidator = async (
  channel,
  ctx,
) => {
  const trChannel = await ctx.cacheRepo.get(channel.id);
  if (!trChannel) return null;
  // TODO: Remove hardcoded value, use a global config file.
  if (trChannel.links.length >= 5) return 'is already linked to 5 channels';
  return null;
};
