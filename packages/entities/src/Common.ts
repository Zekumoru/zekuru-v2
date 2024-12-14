import { Snowflake } from '@zekuru-v2/types';

export interface Createable {
  createdAt: Date;
  createdBy: Snowflake;
}

export interface Modifiable {
  modifiedAt: Date;
  modifiedBy: Snowflake;
}
