/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as Types from '@zekuru-v2/types';
import { CommonRepository } from '../CommonRepository';
import { CacheRepository } from './CacheRepository';
import { CacheRepositoryError } from './CacheRepositoryError';

export abstract class BaseCacheRepository<
  Entity extends Types.Entity,
  CreateDto extends Types.Entity,
  UpdateDto extends Types.Entity,
> {
  constructor(
    private cache: CacheRepository<Entity>,
    private repository: CommonRepository<Entity, CreateDto, UpdateDto>,
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
    ensured?: T,
  ): Promise<T extends true ? Entity : Entity | null> {
    const cached = await this.cache.get(key);
    if (cached) return cached;

    const instance = await this.repository.findById(key);
    if (!instance) {
      if (ensured) {
        throw new CacheRepositoryError(
          'Was ensured but the actual value does not exist!',
        );
      }

      return null as unknown as Entity;
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
      instance = (await this.repository.updateOne(
        data as unknown as UpdateDto,
      ))!;
    } else {
      instance = await this.repository.insertOne(data);
    }

    await this.cache.set(key, instance);
  }

  async setMany(data: (CreateDto | UpdateDto)[]): Promise<void> {
    const dataMap = new Map(data.map((d) => [d._id, d]));
    const keys = Array.from(dataMap.keys());
    // test if already existing
    const existing = await this.repository.findByIds(keys);
    const existingSet = new Set(existing.map((e) => e._id));

    const inserts: CreateDto[] = [];
    const updates: UpdateDto[] = [];

    for (const key of keys) {
      const dto = dataMap.get(key)!;
      if (existingSet.has(key)) {
        updates.push(dto as UpdateDto);
      } else {
        inserts.push(dto as CreateDto);
      }
    }

    const [inserted, updated] = await Promise.all([
      this.repository.insertMany(inserts),
      this.repository.updateMany(updates),
    ]);

    // Update cache
    await Promise.all(
      [...inserted, ...updated].map((instance) =>
        this.cache.set(instance._id, instance),
      ),
    );
  }
}
