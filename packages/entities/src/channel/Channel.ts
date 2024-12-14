import { Snowflake } from '@zekuru-v2/types';
import { Createable, Modifiable } from '../Common';
import { ChannelLanguage } from './ChannelLanguage';

export class Channel implements Createable, Modifiable {
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
