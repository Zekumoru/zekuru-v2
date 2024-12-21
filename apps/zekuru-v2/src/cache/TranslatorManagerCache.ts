import {
  CacheManagerRepository,
  CacheRepository,
} from '@zekuru-v2/repositories';
import TranslatorManager from '../translation/TranslatorManager';
import { Snowflake } from '@zekuru-v2/types';

class TranslatorManagerCacheRepository
  implements CacheRepository<TranslatorManager>
{
  constructor(private cache: CacheRepository<TranslatorManager>) {}

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  async get(guildId: Snowflake): Promise<TranslatorManager> {
    const manager = await this.cache.get(guildId);
    if (manager) return manager;

    await this.set(guildId, new TranslatorManager());
    return await this.get(guildId);
  }

  has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async set(guildId: Snowflake, manager: TranslatorManager): Promise<void> {
    await this.cache.set(guildId, manager);
  }
}

const translatorManagerCache = new CacheManagerRepository<TranslatorManager>({
  ttl: 14 * 86_400_000, // 14 days
});

const TranslatorManagerCache = new TranslatorManagerCacheRepository(
  translatorManagerCache
);

export default TranslatorManagerCache;
