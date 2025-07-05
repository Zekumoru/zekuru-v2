import { Snowflake } from 'discord.js';
import { Model, UpdateQuery } from 'mongoose';
import { CommonRepository } from './CommonRepository';
import * as Types from '@zekuru-v2/types';

export abstract class BaseMongoRepository<
  Entity extends Types.Entity,
  CreateDto extends Types.Entity,
  UpdateDto extends Types.Entity,
> implements CommonRepository<Entity, CreateDto, UpdateDto>
{
  constructor(protected model: Model<Entity>) {}

  async insertOne(entity: CreateDto): Promise<Entity> {
    const instance = new this.model(entity);
    await instance.save();
    return instance;
  }

  async insertMany(entities: CreateDto[]): Promise<Entity[]> {
    const instances = (await this.model.insertMany(
      entities,
    )) as unknown as Entity[];
    return instances;
  }

  async findById(id: Snowflake): Promise<Entity | null> {
    const instance = await this.model.findById(id);
    if (!instance) return null;
    return instance;
  }

  async findByIds(ids: Snowflake[]): Promise<Entity[]> {
    const instances = await this.model.find().where('_id').in(ids);
    return instances;
  }

  async updateOne(entity: UpdateDto): Promise<Entity | null> {
    if (entity instanceof this.model) {
      await entity.save();
      return entity;
    }

    const instance = await this.model.findByIdAndUpdate(
      entity._id,
      entity as UpdateQuery<Entity> | undefined,
      {
        returnOriginal: false,
      },
    );
    return instance as Entity;
  }

  async updateMany(entities: UpdateDto[]): Promise<Entity[]> {
    const operations = entities.map((entity) => ({
      updateOne: {
        filter: { _id: entity._id },
        update: { $set: entity as UpdateQuery<Entity> },
      },
    }));

    await this.model.bulkWrite(operations);
    return this.findByIds(entities.map((e) => e._id));
  }

  async deleteById(id: Snowflake): Promise<boolean> {
    const deleted = await this.model.deleteOne().where('_id').equals(id);
    return deleted.deletedCount !== 0;
  }

  async deleteManyByIds(ids: Snowflake[]): Promise<void> {
    await this.model.deleteMany().where('_id').in(ids);
  }
}
