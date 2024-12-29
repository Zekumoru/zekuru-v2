import { CommonRepository } from '../CommonRepository';
import { CacheRepository } from './CacheRepository';
import { CacheRepositoryError } from './CacheRepositoryError';

export abstract class BaseCacheRepository<Entity, CreateDto, UpdateDto> {
  constructor(
    private cache: CacheRepository<Entity>,
    private repository: CommonRepository<Entity, CreateDto, UpdateDto>
  ) {}

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async delete(key: string, dbAsWell = false): Promise<boolean> {
    let deleted = true;

    if (dbAsWell) {
      deleted = await this.repository.deleteById(key);
    }

    await this.cache.delete(key);

    return deleted;
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

  async has(key: string): Promise<boolean> {
    return (
      (await this.cache.get(key)) != null ||
      (await this.repository.findById(key)) != null
    );
  }

  async set(key: string, data: CreateDto): Promise<void> {
    let instance: Entity;

    if (await this.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      instance = (await this.repository.updateOne(
        data as unknown as UpdateDto
      ))!;
    } else {
      instance = await this.repository.insertOne(data);
    }

    await this.cache.set(key, instance);
  }
}
