import {
  Channel,
  ChannelCreateDto,
  ChannelUpdateDto,
} from '@zekuru-v2/entities';
import { BaseCacheRepository } from '../cache/BaseCacheRepository';

export class ChannelCacheRepository extends BaseCacheRepository<
  Channel,
  ChannelCreateDto,
  ChannelUpdateDto
> {}
