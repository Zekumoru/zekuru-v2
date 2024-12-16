import { Guild } from '@zekuru-v2/entities';
import {
  CacheManagerRepository,
  GuildCacheRepository,
  GuildMongoRepository,
} from '@zekuru-v2/repositories';

const guildCache = new CacheManagerRepository<Guild>({
  ttl: 60 * 60_000, // 1 hour
});

const guildRepository = new GuildMongoRepository();

const GuildCache = new GuildCacheRepository(guildCache, guildRepository);

export default GuildCache;
