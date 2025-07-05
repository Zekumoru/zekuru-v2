/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  CreateDtoUtil,
  Entity,
  Snowflake,
  UpdateDtoUtil,
} from '@zekuru-v2/types';
import { Createable, Modifiable } from '../Common';
import { ChannelLanguage } from './ChannelLanguage';

export interface ChannelMethods {}

export type ChannelCreateDto = CreateDtoUtil<Channel, ChannelMethods>;

export type ChannelUpdateDto = UpdateDtoUtil<ChannelCreateDto>;

export class Channel implements Entity, Createable, Modifiable {
  constructor(
    public _id: Snowflake,
    public guildId: Snowflake,
    public links: Snowflake[],
    public language: ChannelLanguage,
    public createdAt: Date,
    public createdBy: Snowflake,
    public modifiedAt: Date,
    public modifiedBy: Snowflake,
  ) {}
}
