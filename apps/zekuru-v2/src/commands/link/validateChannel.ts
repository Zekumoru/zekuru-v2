import { Channel, channelMention } from 'discord.js';
import {
  ChannelValidator,
  ChannelValidatorContext,
  formatValidationResults,
  isLinkLimitReachedValidator,
  isTextChannelValidator,
  isTranslateChannelValidator,
  runValidators,
} from '@zekuru-v2/core';
import ChannelCache from '../../cache/ChannelCache';

const validations: ChannelValidator[] = [
  isTextChannelValidator,
  isTranslateChannelValidator,
  isLinkLimitReachedValidator,
];

export const validateChannel = async (channel: Channel): Promise<string> => {
  const ctx: ChannelValidatorContext = { cacheRepo: ChannelCache };
  const results = await runValidators(channel, ctx, validations);
  if (!results.length) return '';
  return `${channelMention(channel.id)} ${formatValidationResults(results)}`;
};

export default validateChannel;
