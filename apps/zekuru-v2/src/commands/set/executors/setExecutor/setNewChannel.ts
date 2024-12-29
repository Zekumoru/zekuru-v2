import { ChannelLanguage } from '@zekuru-v2/entities';
import ChannelCache from '../../../../cache/ChannelCache';

const setNewChannel = async (
  userId: string,
  guildId: string,
  channelId: string,
  channelLanguage: ChannelLanguage
): Promise<void> => {
  await ChannelCache.set(channelId, {
    guildId,
    _id: channelId,
    createdBy: userId,
    modifiedBy: userId,
    links: [],
    language: channelLanguage,
  });
};

export default setNewChannel;
