import { Channel } from '@zekuru-v2/entities';
import {
  CacheManagerRepository,
  ChannelCacheRepository,
  ChannelMongoRepository,
} from '@zekuru-v2/repositories';

const channelCache = new CacheManagerRepository<Channel>({
  ttl: 14 * 86_400_000, // 14 days
});

const channelRepository = new ChannelMongoRepository();

const ChannelCache = new ChannelCacheRepository(
  channelCache,
  channelRepository
);

export default ChannelCache;
