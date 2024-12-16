import { Guild, GuildCreateDto, GuildUpdateDto } from '@zekuru-v2/entities';
import { BaseCacheRepository } from '../cache/BaseCacheRepository';

export class GuildCacheRepository extends BaseCacheRepository<
  Guild,
  GuildCreateDto,
  GuildUpdateDto
> {}
