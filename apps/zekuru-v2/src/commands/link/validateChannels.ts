import { Channel } from 'discord.js';
import validateChannel from './validateChannel';

export const validateChannels = async (
  channels: Channel[],
): Promise<string[]> => {
  const results = await Promise.all(
    channels.map((channel) => validateChannel(channel)),
  );

  return results.filter(Boolean);
};

export default validateChannels;
