import { Message } from '@zekuru-v2/entities';
import { CommonRepository } from '../CommonRepository';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
export interface MessageRepository extends CommonRepository<Message> {}
