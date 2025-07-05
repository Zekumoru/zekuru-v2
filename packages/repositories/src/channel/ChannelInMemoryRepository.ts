import {
  Channel,
  ChannelCreateDto,
  ChannelUpdateDto,
} from '@zekuru-v2/entities';
import { BaseInMemoryRepository } from '../BaseInMemoryRepository';

export class ChannelInMemoryRepository extends BaseInMemoryRepository<
  Channel,
  ChannelCreateDto,
  ChannelUpdateDto
> {}
