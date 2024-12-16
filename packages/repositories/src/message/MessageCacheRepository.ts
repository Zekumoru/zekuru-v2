import {
  Message,
  MessageCreateDto,
  MessageUpdateDto,
} from '@zekuru-v2/entities';
import { BaseCacheRepository } from '../cache/BaseCacheRepository';

export class MessageCacheRepository extends BaseCacheRepository<
  Message,
  MessageCreateDto,
  MessageUpdateDto
> {}
