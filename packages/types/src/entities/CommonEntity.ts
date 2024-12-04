import { Snowflake } from './Snowflake';

export interface CommonEntity {
  createdAt: Date;
  createdBy: Snowflake;
  modifiedAt: Date;
  modifiedBy: Snowflake;
}
