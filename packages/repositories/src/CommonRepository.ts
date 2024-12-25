import { Snowflake } from 'discord.js';

export interface CommonRepository<Entity, CreateDto, UpdateDto> {
  insertOne(entity: CreateDto): Promise<Entity>;
  insertMany(entities: CreateDto[]): Promise<Entity[]>;
  findById(id: Snowflake): Promise<Entity | null>;
  findByIds(ids: Snowflake[]): Promise<Entity[]>;
  updateOne(entity: UpdateDto): Promise<Entity | null>;
  updateMany(entities: UpdateDto[]): Promise<Entity[]>;
  deleteById(id: Snowflake): Promise<void>;
  deleteManyByIds(ids: Snowflake[]): Promise<void>;
}
