import { Snowflake } from 'discord.js';

export interface CommonRepository<T> {
  insertOne: (entity: T) => Promise<T>;
  insertMany: (entities: T[]) => Promise<T[]>;
  findById: (id: Snowflake) => Promise<T | null>;
  updateOne: (entities: T) => Promise<T>;
  updateMany: (entities: T[]) => Promise<T[]>;
  deleteById: (id: Snowflake) => Promise<void>;
  deleteMany: (entities: T[]) => Promise<void>;
}
