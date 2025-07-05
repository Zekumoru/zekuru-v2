import { createCache, CreateCacheOptions } from 'cache-manager';
import { CacheRepository } from './CacheRepository';
import Keyv from 'keyv';

export class CacheManagerRepository<T> implements CacheRepository<T> {
  private cache: ReturnType<typeof createCache>;

  constructor(options: CreateCacheOptions) {
    const keyv = new Keyv({ serialize: undefined, deserialize: undefined });
    this.cache = createCache({ stores: [keyv], ...options });
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async delete(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async get(key: string): Promise<T | null> {
    // As of cache-manager v7.0, they return `undefined` than `null`
    return this.cache.get<T>(key).then((value) => value ?? null);
  }

  async has(key: string): Promise<boolean> {
    return !!(await this.get(key));
  }

  async set(key: string, data: T): Promise<void> {
    await this.cache.set<T>(key, data);
  }
}
