import { Snowflake } from '../Snowflake';

export interface CommonCredential {
  addedAt: Date;
  addedBy: Snowflake;
}
