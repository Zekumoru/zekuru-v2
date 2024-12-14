import { Channel } from '@zekuru-v2/entities';
import { ChannelModel } from '@zekuru-v2/db';
import { ChannelRepository } from './ChannelRepository';
import { Snowflake } from 'discord.js';
import { HydratedDocument } from 'mongoose';

export class ChannelMongoRepository implements ChannelRepository {
  async insertOne(channel: Channel): Promise<Channel> {
    const instance = new ChannelModel(channel);
    await instance.save();
    return instance;
  }

  async insertMany(channels: Channel[]): Promise<Channel[]> {
    const instances = await ChannelModel.insertMany(channels);
    return instances;
  }

  async findById(id: Snowflake): Promise<Channel | null> {
    const instance = await ChannelModel.findById(id);
    if (!instance) return null;
    return instance;
  }

  async findByIds(ids: Snowflake[]): Promise<Channel[]> {
    const instances = await ChannelModel.find().where('_id').in(ids);
    return instances;
  }

  async updateOne(channel: Partial<Channel>): Promise<Channel> {
    if (channel instanceof ChannelModel) {
      await channel.save();
      return channel;
    }

    const instance = await ChannelModel.findByIdAndUpdate(
      channel._id,
      channel,
      { returnOriginal: false }
    );
    return instance;
  }

  async updateMany(channels: Partial<Channel>[]): Promise<Channel[]> {
    const map = new Map(channels.map((channel) => [channel._id, channel]));
    const oldInstances = (await this.findByIds([
      ...map.keys(),
    ])) as HydratedDocument<Channel>[];

    // validate first before updating
    const instances = await Promise.all(
      oldInstances.map(async (instance) => {
        instance.set(map.get(instance._id));
        await instance.validate();
        return instance;
      })
    );

    return await Promise.all(
      instances.map(async (instance) => await instance.save())
    );
  }

  async deleteById(id: Snowflake): Promise<void> {
    await ChannelModel.deleteOne().where('_id').equals(id);
  }

  async deleteManyByIds(ids: Snowflake[]): Promise<void> {
    await ChannelModel.deleteMany().where('_id').in(ids);
  }
}
