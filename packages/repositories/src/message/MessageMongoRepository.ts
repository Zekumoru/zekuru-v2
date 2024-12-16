import {
  Message,
  MessageCreateDto,
  MessageUpdateDto,
} from '@zekuru-v2/entities';
import { MessageModel } from '@zekuru-v2/db';
import { BaseMongoRepository } from '../BaseMongoRepository';
import { Model } from 'mongoose';

export class MessageMongoRepository extends BaseMongoRepository<
  Message,
  MessageCreateDto,
  MessageUpdateDto
> {
  constructor() {
    super(MessageModel as Model<Message>);
  }
}
