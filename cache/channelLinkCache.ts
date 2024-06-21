import { Collection } from 'discord.js';
import ChannelLink, { IChannelLink } from '../db/models/ChannelLink';

const cacheLinks = new Collection<string, IChannelLink>();

const fetchOrCreateLink = async (channelId: string, guildId: string) => {
  // fetch from db, if not exists, create new
  const link = await ChannelLink.findOne({ id: channelId })
    .populate('links')
    .exec();
  if (link) return link;

  const newLink = new ChannelLink({
    // guildId,
    id: channelId,
    links: [],
  });
  await newLink.save();
  return newLink;
};

const create = async (channelId: string, guildId: string) => {
  // create otherwise fetch
  const link = await fetchOrCreateLink(channelId, guildId);

  cacheLinks.set(channelId, {
    _id: link._id,
    id: link.id,
    guildId: link.guildId,
    links: link.links,
    createdAt: link.createdAt,
  });
  return cacheLinks.get(channelId)!;
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

const update = async (channelLink: IChannelLink) => {
  // update in db
  const link = await fetchOrCreateLink(channelLink.id, channelLink.guildId);
  link.overwrite(channelLink);
  await link.save();

  // update cache
  cacheLinks.set(channelLink.id, {
    _id: link._id,
    id: link.id,
    guildId: link.guildId,
    links: link.links,
    createdAt: link.createdAt,
  });
};

const deleteLink = async (channelId: string) => {
  // check if it exists first
  if ((await get(channelId)) == null) return;

  // delete from db
  await ChannelLink.deleteOne({ id: channelId });

  // remove from cache
  cacheLinks.delete(channelId);
};

const clear = () => {
  cacheLinks.clear();
};

export default { create, update, get, delete: deleteLink, clear };
