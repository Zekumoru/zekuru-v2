import { Guild } from '@zekuru-v2/entities';
import { GuildModel } from '@zekuru-v2/db';
import { BaseMongoRepository } from '../BaseMongoRepository';

export class GuildMongoRepository extends BaseMongoRepository<Guild> {
  constructor() {
    super(GuildModel);
  }
}
