import { Snowflake } from '@zekuru-v2/types';

export class Message {
  constructor(
    public _id: Snowflake,
    public authorId: Snowflake,
    public channelId: Snowflake,
    public guildId: Snowflake,
    public linkId: Snowflake,
    public createdAt: Date
  ) {}
}
