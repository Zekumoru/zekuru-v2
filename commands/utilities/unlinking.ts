import cache from '../../cache';
import { IChannelLink } from '../../db/models/ChannelLink';

export const unlinkChannel = async (
  channelLink: IChannelLink,
  channelId: string
) => {
  if (channelLink.links.find((link) => link.id === channelId)) {
    channelLink.links = channelLink.links.filter(
      (trChannel) => trChannel.id !== channelId
    );

    if (channelLink.links.length === 0) {
      // remove channelLink since it doesn't have any links anymore
      // because it cannot be called "channelLink" with no links
      await cache.channelLink.delete(channelLink.id);
    } else {
      await cache.channelLink.update(channelLink);
    }

    return true;
  }
  return false;
};
