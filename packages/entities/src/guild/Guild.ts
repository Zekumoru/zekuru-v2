import { Snowflake } from '@zekuru-v2/types';
import { GuildTranslationMeta } from './GuildTranslationMeta';
import { Createable, Modifiable } from '../Common';

export class Guild implements Createable, Modifiable {
  constructor(
    public _id: Snowflake,
    public translation: GuildTranslationMeta,
    public createdAt: Date,
    public createdBy: Snowflake,
    public modifiedAt: Date,
    public modifiedBy: Snowflake
  ) {}
}
