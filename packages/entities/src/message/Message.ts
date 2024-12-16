/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreateDtoUtil, Snowflake, UpdateDtoUtil } from '@zekuru-v2/types';

export interface MessageMethods {}

export type MessageCreateDto = CreateDtoUtil<Message, MessageMethods>;

export type MessageUpdateDto = UpdateDtoUtil<MessageCreateDto>;

export class Message {
  constructor(
    public _id: Snowflake,
    public authorId: Snowflake,
    public channelId: Snowflake,
    public guildId: Snowflake,
    public linkId: Snowflake,
    public createdAt: Date
  ) {}
}
