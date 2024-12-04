import {
  CommonEntity,
  GuildTranslationMeta,
  Snowflake,
} from '@zekuru-v2/types';

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
