import { Snowflake } from '@zekuru-v2/types';
import { CommonEntity } from '../CommonEntity';
import { GuildTranslationMeta } from './GuildTranslationMeta';

export class Guild implements CommonEntity {
  constructor(
    public _id: Snowflake,
    public translation: GuildTranslationMeta,
    public createdAt: Date,
    public createdBy: Snowflake,
    public modifiedAt: Date,
    public modifiedBy: Snowflake
  ) {}
}
