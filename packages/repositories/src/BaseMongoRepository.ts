import { Snowflake } from 'discord.js';
import { HydratedDocument, Model } from 'mongoose';
import { CommonRepository } from './CommonRepository';

export abstract class BaseMongoRepository<T> implements CommonRepository<T> {
  constructor(private model: Model<T>) {}

  private getId(entity: Partial<T>): string {
    return (entity as unknown as { _id: string })._id;
  }

  async insertOne(entity: T): Promise<T> {
    const instance = new this.model(entity);
    await instance.save();
    return instance;
  }

  async insertMany(entities: T[]): Promise<T[]> {
    const instances = await this.model.insertMany(entities);
    return instances;
  }

  async findById(id: Snowflake): Promise<T | null> {
    const instance = await this.model.findById(id);
    if (!instance) return null;
    return instance;
  }

  async findByIds(ids: Snowflake[]): Promise<T[]> {
    const instances = await this.model.find().where('_id').in(ids);
    return instances;
  }

  async updateOne(entity: Partial<T>): Promise<T> {
    if (entity instanceof this.model) {
      await entity.save();
      return entity;
    }

    const instance = await this.model.findByIdAndUpdate(
      this.getId(entity),
      entity,
      {
        returnOriginal: false,
      }
    );
    return instance;
  }

  async updateMany(entities: Partial<T>[]): Promise<T[]> {
    const map = new Map(entities.map((entity) => [this.getId(entity), entity]));
    const oldInstances = (await this.findByIds([
      ...map.keys(),
    ])) as HydratedDocument<T>[];

    // validate first before updating
    const instances = await Promise.all(
      oldInstances.map(async (instance) => {
        instance.set(map.get(this.getId(instance)));
        await instance.validate();
        return instance;
      })
    );

    return (await Promise.all(
      instances.map(async (instance) => await instance.save())
    )) as T[];
  }

  async deleteById(id: Snowflake): Promise<void> {
    await this.model.deleteOne().where('_id').equals(id);
  }

  async deleteManyByIds(ids: Snowflake[]): Promise<void> {
    await this.model.deleteMany().where('_id').in(ids);
  }
}
