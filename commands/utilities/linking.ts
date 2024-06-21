import cache from '../../cache';
import { IChannelLink } from '../../db/models/ChannelLink';
import { ITranslateChannel } from '../../db/models/TranslateChannel';

export const CHANNEL_LINK_LIMIT = isNaN(Number(process.env.CHANNEL_LINK_LIMIT))
  ? 5
  : Number(process.env.CHANNEL_LINK_LIMIT);

export const getOrCreateChLink = async (channelId: string, guildId: string) => {
  return (
    (await cache.channelLink.get(channelId)) ??
    (await cache.channelLink.create(channelId, guildId))
  );
};

export const linkChannel = async (
  channelLink: IChannelLink,
  channelId: string,
  translateChannel: ITranslateChannel
) => {
  if (channelLink.links.find((link) => link.id === channelId) === undefined) {
    channelLink.links.push(translateChannel);
    await cache.channelLink.update(channelLink);
    return true;
  }
  return false;
};

export interface IAllChLinkMapValue {
  chLink: IChannelLink;
  trChannel: ITranslateChannel;
}

export const linkChannelSync = (
  channelLink: IChannelLink,
  channelId: string,
  translateChannel: ITranslateChannel
) => {
  if (channelLink.links.find((link) => link.id === channelId) === undefined) {
    channelLink.links.push(translateChannel);
    return true;
  }
  return false;
};

export const linkChannels = async (
  allChLinkMap: Map<string, IAllChLinkMapValue>
) => {
  let linked = false;
  allChLinkMap.forEach(({ chLink: sourceChLink }) => {
    allChLinkMap.forEach(
      ({ chLink: targetChLink, trChannel: targetTrChannel }) => {
        if (sourceChLink === targetChLink) return;

        linked =
          linkChannelSync(sourceChLink, targetChLink.id, targetTrChannel) ||
          linked;
      }
    );
  });

  // save to db
  const promises: Promise<void>[] = [];
  allChLinkMap.forEach(({ chLink }) => {
    promises.push(
      (async () => {
        await cache.channelLink.update(chLink);
      })()
    );
  });
  await Promise.all(promises);

  return linked;
};

/**
 * Builds a map which contains all of the channels that are linked
 * together, doesn't matter even if unidirectional.
 */
export const buildAllChannelsLinkMap = async (channelLinks: IChannelLink[]) => {
  const jobQueue: IChannelLink[] = [...channelLinks];
  const allChLinkMap = new Map<string, IAllChLinkMapValue>();

  // build map containing all channels
  while (jobQueue.length) {
    const chLink = jobQueue.shift()!;

    for (const link of chLink.links) {
      if (allChLinkMap.get(link.id)) continue;

      const [linkTrChannel, linkChLink] = await Promise.all([
        cache.translateChannel.get(link.id),
        getOrCreateChLink(link.id, chLink.guildId),
      ]);
      jobQueue.push(linkChLink);

      if (!linkTrChannel) continue;

      allChLinkMap.set(linkChLink.id, {
        chLink: linkChLink,
        trChannel: linkTrChannel,
      });
    }
  }

  return allChLinkMap;
};
