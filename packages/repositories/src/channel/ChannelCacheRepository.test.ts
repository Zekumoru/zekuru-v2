/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * This tests the functionalities of the BaseCacheRepository.
 *
 * And for testing purposes, Channel is used but this test should apply
 * to all other entities which uses the BaseCacheRepository.
 */
import { Channel, ChannelLanguage } from '@zekuru-v2/entities';
import { CacheManagerRepository } from '../cache/CacheManagerRepository';
import { ChannelInMemoryRepository } from './ChannelInMemoryRepository';
import { ChannelCacheRepository } from './ChannelCacheRepository';

function createChannel(id: string, links: string[] = []): Channel {
  const now = new Date('2025-01-01'); // fixed date
  const dummyLang: ChannelLanguage = { code: 'en' };
  return new Channel(id, 'guild', links, dummyLang, now, 'user', now, 'user');
}

describe('ChannelCacheRepository', () => {
  it('should store a channel in the cache and retrieve it correctly', async () => {
    const channelCache = new CacheManagerRepository<Channel>({
      ttl: 14 * 86_400_000, // 14 days
    });
    const channelRepository = new ChannelInMemoryRepository();
    const ChannelCache = new ChannelCacheRepository(
      channelCache,
      channelRepository,
    );
    const channel = createChannel('123');

    await ChannelCache.set(channel._id, channel);

    expect(ChannelCache.has(channel._id)).resolves.toBe(true);
    expect(ChannelCache.get(channel._id)).resolves.not.toBeNull();
  });

  it('should clear the cache but not the database', async () => {
    const channelCache = new CacheManagerRepository<Channel>({
      ttl: 14 * 86_400_000, // 14 days
    });
    const channelRepository = new ChannelInMemoryRepository();
    const ChannelCache = new ChannelCacheRepository(
      channelCache,
      channelRepository,
    );

    const a = createChannel('A');
    await ChannelCache.set(a._id, a);
    const b = createChannel('B');
    await ChannelCache.set(b._id, b);
    const c = createChannel('C');
    await ChannelCache.set(c._id, c);

    await ChannelCache.clear();

    expect(channelCache.get(a._id)).resolves.toBeNull();
    expect(channelCache.get(b._id)).resolves.toBeNull();
    expect(channelCache.get(c._id)).resolves.toBeNull();
    expect(ChannelCache.get(a._id)).resolves.not.toBeNull();
    expect(ChannelCache.get(b._id)).resolves.not.toBeNull();
    expect(ChannelCache.get(c._id)).resolves.not.toBeNull();
  });

  it('should delete a channel in the cache and in the database', async () => {
    const channelCache = new CacheManagerRepository<Channel>({
      ttl: 14 * 86_400_000, // 14 days
    });
    const channelRepository = new ChannelInMemoryRepository();
    const ChannelCache = new ChannelCacheRepository(
      channelCache,
      channelRepository,
    );
    const channel = createChannel('123');

    await ChannelCache.delete(channel._id);

    expect(ChannelCache.has(channel._id)).resolves.toBe(false);
    expect(ChannelCache.get(channel._id)).resolves.toBeNull();
    expect(channelRepository.findById(channel._id)).resolves.toBeNull();
  });

  it('should set many channels persisting them in the database', async () => {
    const channelCache = new CacheManagerRepository<Channel>({
      ttl: 14 * 86_400_000, // 14 days
    });
    const channelRepository = new ChannelInMemoryRepository();
    const ChannelCache = new ChannelCacheRepository(
      channelCache,
      channelRepository,
    );

    const a = createChannel('A');
    const b = createChannel('B');
    const c = createChannel('C');
    const channels = [a, b, c];

    await ChannelCache.setMany(channels);

    const ids = channels.map((c) => c._id);
    expect(channelRepository.findByIds(ids)).resolves.toMatchSnapshot();
    expect(ChannelCache.get(a._id)).resolves.not.toBeNull();
    expect(ChannelCache.get(b._id)).resolves.not.toBeNull();
    expect(ChannelCache.get(c._id)).resolves.not.toBeNull();
  });

  it('should set many channels persisting changes if already present in the database', async () => {
    const channelCache = new CacheManagerRepository<Channel>({
      ttl: 14 * 86_400_000, // 14 days
    });
    const channelRepository = new ChannelInMemoryRepository();
    const ChannelCache = new ChannelCacheRepository(
      channelCache,
      channelRepository,
    );
    const preA = createChannel('A');
    const a = createChannel('A');
    const b = createChannel('B');
    const c = createChannel('C');
    const channels = [a, b, c];

    channelRepository.insertOne(preA);
    a.links = [b._id];
    await ChannelCache.setMany(channels);

    const ids = channels.map((c) => c._id);
    expect(channelRepository.findByIds(ids)).resolves.toMatchSnapshot();
    expect(preA.links).not.toContain(b._id);
    const aFromDb = (await channelRepository.findById(preA._id))!;
    expect(aFromDb.links).toContain(b._id);
    const aFromCache = (await ChannelCache.get(preA._id))!;
    expect(aFromCache.links).toContain(b._id);
  });
});
