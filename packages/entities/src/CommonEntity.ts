import { Snowflake } from '@zekuru-v2/types';

export interface CommonEntity {
  createdAt: Date;
  createdBy: Snowflake;
  modifiedAt: Date;
  modifiedBy: Snowflake;
}
