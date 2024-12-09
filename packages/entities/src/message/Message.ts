import { Snowflake } from '@zekuru-v2/types';
import { CommonEntity } from '../CommonEntity';

export class Message implements CommonEntity {
  constructor(
    public _id: Snowflake,
    public authorId: Snowflake,
    public channelId: Snowflake,
    public guildId: Snowflake,
    public createdAt: Date,
    public createdBy: Snowflake,
    public modifiedAt: Date,
    public modifiedBy: Snowflake
  ) {}
}
