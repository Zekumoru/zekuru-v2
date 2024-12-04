import { ChannelLanguage, CommonEntity, Snowflake } from '@zekuru-v2/types';

export class Channel implements CommonEntity {
  constructor(
    public _id: Snowflake,
    public guildId: Snowflake,
    public links: Snowflake[],
    public language: ChannelLanguage,
    public createdAt: Date,
    public createdBy: Snowflake,
    public modifiedAt: Date,
    public modifiedBy: Snowflake
  ) {}
}
