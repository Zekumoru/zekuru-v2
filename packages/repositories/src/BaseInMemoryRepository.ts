/* eslint-disable @typescript-eslint/no-explicit-any */
import { Snowflake } from 'discord.js';
import { CommonRepository } from './CommonRepository';
import * as Types from '@zekuru-v2/types';

export abstract class BaseInMemoryRepository<
  Entity extends Types.Entity,
  CreateDto extends Types.Entity,
  UpdateDto extends Types.Entity,
> implements CommonRepository<Entity, CreateDto, UpdateDto>
{
  private store = new Map<Snowflake, Entity>();

  async insertOne(entity: CreateDto): Promise<Entity> {
    this.store.set(entity._id, structuredClone(entity as any));
    return entity as any;
  }

  async insertMany(entities: CreateDto[]): Promise<Entity[]> {
    for (const entity of entities) {
      this.store.set(entity._id, structuredClone(entity as any));
    }
    return entities as any[];
  }

  async findById(id: Snowflake): Promise<Entity | null> {
    return this.store.get(id) ?? null;
  }

  async findByIds(ids: Snowflake[]): Promise<Entity[]> {
    return ids.map((id) => this.store.get(id)).filter(Boolean) as any[];
  }

  async updateOne(entity: UpdateDto): Promise<Entity | null> {
    if (!this.store.has(entity._id)) return null;
    this.store.set(entity._id, structuredClone(entity as any));
    return entity as any;
  }

  async updateMany(entities: UpdateDto[]): Promise<Entity[]> {
    const updated: Entity[] = [];
    for (const entity of entities) {
      if (this.store.has(entity._id)) {
        this.store.set(entity._id, structuredClone(entity as any));
        updated.push(entity as any);
      }
    }
    return updated;
  }

  async deleteById(id: Snowflake): Promise<boolean> {
    return this.store.delete(id);
  }

  async deleteManyByIds(ids: Snowflake[]): Promise<void> {
    for (const id of ids) {
      this.store.delete(id);
    }
  }
}
