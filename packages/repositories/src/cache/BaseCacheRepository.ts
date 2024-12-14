import { CommonRepository } from '../CommonRepository';
import { CacheRepository } from './CacheRepository';

export abstract class BaseCacheRepository<T> {
  constructor(
    private cache: CacheRepository<T>,
    private repository: CommonRepository<T>
  ) {}

  private async alreadyExists(key: string) {
    return (
      (await this.cache.get(key)) != null ||
      (await this.repository.findById(key)) != null
    );
  }

  async set(key: string, data: T): Promise<void> {
    let instance: T;

    if (await this.alreadyExists(key))
      instance = await this.repository.updateOne(data);
    else instance = await this.repository.insertOne(data);

    await this.cache.set(key, instance);
  }

  async get(key: string): Promise<T | null> {
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const instance = await this.repository.findById(key);
    if (!instance) return null;

    await this.cache.set(key, instance);
    return instance;
  }
}
