import { CommonRepository } from '../CommonRepository';
import { CacheRepository } from './CacheRepository';

export abstract class BaseCacheRepository<Entity, CreateDto, UpdateDto> {
  constructor(
    private cache: CacheRepository<Entity>,
    private repository: CommonRepository<Entity, CreateDto, UpdateDto>
  ) {}

  private async alreadyExists(key: string) {
    return (
      (await this.cache.get(key)) != null ||
      (await this.repository.findById(key)) != null
    );
  }

  async set(key: string, data: CreateDto): Promise<void> {
    let instance: Entity;

    if (await this.alreadyExists(key))
      instance = await this.repository.updateOne(data as unknown as UpdateDto);
    else instance = await this.repository.insertOne(data);

    await this.cache.set(key, instance);
  }

  async get(key: string): Promise<Entity | null> {
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const instance = await this.repository.findById(key);
    if (!instance) return null;

    await this.cache.set(key, instance);
    return instance;
  }
}
