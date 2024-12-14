import { Channel } from '@zekuru-v2/entities';
import { ChannelModel } from '@zekuru-v2/db';
import { BaseMongoRepository } from '../BaseMongoRepository';

export class ChannelMongoRepository extends BaseMongoRepository<Channel> {
  constructor() {
    super(ChannelModel);
  }
}
