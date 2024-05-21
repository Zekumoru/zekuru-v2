import { Collection } from 'discord.js';
import type { ITranslateChannel } from '../models/TranslateChannel';
import TranslateChannel from '../models/TranslateChannel';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';

const channels = new Collection<string, ITranslateChannel>();

const getChannel = async (
  channelId: string,
  guildId: string,
  sourceLang: string,
  targetLang: string
) => {
  // fetch from db, if not exists, create new
  const channel = await TranslateChannel.findOne({ id: channelId });
  if (channel) return channel;

  const newChannel = new TranslateChannel({
    id: channelId,
    guildId,
    sourceLang,
    targetLang,
  });
  await newChannel.save();
  return newChannel;
};

const set = async (
  channelId: string,
  guildId: string,
  sourceLang: string,
  targetLang: string
) => {
  // update in db
  const channel = await getChannel(channelId, guildId, sourceLang, targetLang);
  channel.overwrite({
    id: channelId,
    guildId: channel.guildId,
    sourceLang,
    targetLang,
    createdAt: channel.createdAt,
  });
  await channel.save();

  // update cache
  channels.set(channelId, {
    _id: channel._id,
    id: channel.id,
    guildId: channel.guildId,
    targetLang: channel.targetLang as TargetLanguageCode,
    sourceLang: channel.sourceLang as SourceLanguageCode,
    createdAt: channel.createdAt,
  });
};

const get = async (channelId: string) => {
  // get from cache
  const channelCache = channels.get(channelId);
  if (channelCache) return channelCache;

  // if not exists, fetch from db and set to cache
  const channel = await TranslateChannel.findOne({ id: channelId });
  if (!channel) return null;

  // update cache
  channels.set(channelId, {
    _id: channel._id,
    id: channel.id,
    guildId: channel.guildId,
    targetLang: channel.targetLang as TargetLanguageCode,
    sourceLang: channel.sourceLang as SourceLanguageCode,
    createdAt: channel.createdAt,
  });
  return channels.get(channelId)!;
};

const unset = async (channelId: string) => {
  // check if it exists first
  if ((await get(channelId)) == null) return;

  // delete from db
  await TranslateChannel.deleteOne({ id: channelId });

  // remove from cache
  channels.delete(channelId);
};

export default { set, unset, get };
