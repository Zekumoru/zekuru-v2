import { Guild, GuildCreateDto, GuildUpdateDto } from '@zekuru-v2/entities';
import { GuildModel } from '@zekuru-v2/db';
import { BaseMongoRepository } from '../BaseMongoRepository';
import { Model } from 'mongoose';

export class GuildMongoRepository extends BaseMongoRepository<
  Guild,
  GuildCreateDto,
  GuildUpdateDto
> {
  constructor() {
    super(GuildModel as Model<Guild>);
  }
}
