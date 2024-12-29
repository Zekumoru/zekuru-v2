import { Channel, ChannelLanguage } from '@zekuru-v2/entities';

const alreadySetToSameLanguage = (
  channel: Channel,
  channelLanguage: ChannelLanguage
) => {
  return (
    channel.language.code === channelLanguage.code &&
    channel.language.variantCode === channelLanguage.variantCode
  );
};

export default alreadySetToSameLanguage;
