import { Collection } from 'discord.js';
import ChannelLink, { IChannelLink } from '../models/ChannelLink';

const cacheLinks = new Collection<string, IChannelLink>();

const getLink = async (channelId: string, guildId: string) => {
  // fetch from db, if not exists, create new
  const link = await ChannelLink.findOne({ id: channelId })
    .populate('links')
    .exec();
  if (link) return link;

  const newLink = new ChannelLink({
    guildId,
    id: channelId,
    links: [],
  });
  await newLink.save();
  return newLink;
};

const create = async (channelId: string, guildId: string) => {
  // create otherwise fetch
  const link = await getLink(channelId, guildId);

  cacheLinks.set(channelId, {
    guildId,
    _id: link._id,
    id: link.id,
    links: link.links,
    createdAt: link.createdAt,
  });
  return cacheLinks.get(channelId)!;
};

const update = async (channelLink: IChannelLink) => {
  // update in db
  const link = await getLink(channelLink.id, channelLink.guildId);
  link.overwrite(channelLink);
  await link.save();

  // update cache
  cacheLinks.set(
    channelLink.id,
    await getLink(channelLink.id, channelLink.guildId)
  );
};

const get = async (channelId: string) => {
  // get from cache
  const linkCache = cacheLinks.get(channelId);
  if (linkCache) return linkCache;

  // if not exists, fetch from db and set to cache
  const link = await ChannelLink.findOne({ id: channelId })
    .populate('links')
    .exec();
  if (!link) return null;

  cacheLinks.set(channelId, {
    _id: link._id,
    id: link.id,
    guildId: link.guildId,
    links: link.links,
    createdAt: link.createdAt,
  });
  return cacheLinks.get(channelId)!;
};

const deleteLink = async (channelId: string) => {
  // check if it exists first
  if ((await get(channelId)) == null) return;

  // delete from db
  await ChannelLink.deleteOne({ id: channelId });

  // remove from cache
  cacheLinks.delete(channelId);
};

export default { create, update, get, delete: deleteLink };
