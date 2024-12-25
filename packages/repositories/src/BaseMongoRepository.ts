/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Snowflake } from 'discord.js';
import { HydratedDocument, Model, UpdateQuery } from 'mongoose';
import { CommonRepository } from './CommonRepository';

export abstract class BaseMongoRepository<Entity, CreateDto, UpdateDto>
  implements CommonRepository<Entity, CreateDto, UpdateDto>
{
  constructor(protected model: Model<Entity>) {}

  private getId(entity: Entity): string {
    return (entity as unknown as { _id: string })._id;
  }

  async insertOne(entity: CreateDto): Promise<Entity> {
    const instance = new this.model(entity);
    await instance.save();
    return instance;
  }

  async insertMany(entities: CreateDto[]): Promise<Entity[]> {
    const instances = (await this.model.insertMany(entities)) as Entity[];
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
      this.getId(entity as unknown as Entity),
      entity as UpdateQuery<Entity> | undefined,
      {
        returnOriginal: false,
      }
    );
    return instance as Entity;
  }

  async updateMany(entities: UpdateDto[]): Promise<Entity[]> {
    const map = new Map(
      entities.map((entity) => [
        this.getId(entity as unknown as Entity),
        entity,
      ])
    );
    const oldInstances = (await this.findByIds([
      ...map.keys(),
    ])) as HydratedDocument<Entity>[];

    // validate first before updating
    const instances = await Promise.all(
      oldInstances.map(async (instance) => {
        instance.set(map.get(this.getId(instance))!);
        await instance.validate();
        return instance;
      })
    );

    return (await Promise.all(
      instances.map(async (instance) => await instance.save())
    )) as Entity[];
  }

  async deleteById(id: Snowflake): Promise<void> {
    await this.model.deleteOne().where('_id').equals(id);
  }

  async deleteManyByIds(ids: Snowflake[]): Promise<void> {
    await this.model.deleteMany().where('_id').in(ids);
  }
}
