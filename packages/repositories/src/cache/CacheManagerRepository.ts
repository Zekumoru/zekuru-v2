import { createCache, CreateCacheOptions } from 'cache-manager';
import { CacheRepository } from './CacheRepository';

export class CacheManagerRepository<T> implements CacheRepository<T> {
  private cache: ReturnType<typeof createCache>;

  constructor(options: CreateCacheOptions) {
    this.cache = createCache(options);
  }

  async get(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set(key: string, data: T): Promise<void> {
    this.cache.set<T>(key, data);
  }
}
