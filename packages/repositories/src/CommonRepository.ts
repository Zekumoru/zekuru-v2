import { Snowflake } from 'discord.js';

export interface CommonRepository<T> {
  insertOne(entity: T): Promise<T>;
  insertMany(entities: T[]): Promise<T[]>;
  findById(id: Snowflake): Promise<T | null>;
  findByIds(ids: Snowflake[]): Promise<T[]>;
  updateOne(entity: Partial<T>): Promise<T>;
  updateMany(entities: Partial<T>[]): Promise<T[]>;
  deleteById(id: Snowflake): Promise<void>;
  deleteManyByIds(ids: Snowflake[]): Promise<void>;
}
