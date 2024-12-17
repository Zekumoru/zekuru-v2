import { CommonRepository } from '../CommonRepository';
import { CacheRepository } from './CacheRepository';
import { CacheRepositoryError } from './CacheRepositoryError';

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

  async get<T extends boolean = false>(
    key: string,
    ensured?: T
  ): Promise<T extends true ? Entity : Entity | null> {
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const instance = await this.repository.findById(key);
    if (!instance) {
      if (ensured) {
        throw new CacheRepositoryError(
          'Was ensured but the actual value does not exist!'
        );
      }

      return null as Entity;
    }

    await this.cache.set(key, instance);
    return instance;
  }
}
