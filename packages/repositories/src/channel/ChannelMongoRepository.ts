import {
  Channel,
  ChannelCreateDto,
  ChannelUpdateDto,
} from '@zekuru-v2/entities';
import { ChannelModel } from '@zekuru-v2/db';
import { BaseMongoRepository } from '../BaseMongoRepository';
import { Model } from 'mongoose';

export class ChannelMongoRepository extends BaseMongoRepository<
  Channel,
  ChannelCreateDto,
  ChannelUpdateDto
> {
  constructor() {
    super(ChannelModel as Model<Channel>);
  }
}
