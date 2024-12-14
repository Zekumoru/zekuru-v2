import { Message } from '@zekuru-v2/entities';
import { MessageModel } from '@zekuru-v2/db';
import { BaseMongoRepository } from '../BaseMongoRepository';

export class MessageMongoRepository extends BaseMongoRepository<Message> {
  constructor() {
    super(MessageModel);
  }
}
