import {
  Language,
  LanguageCreateDto,
  LanguageUpdateDto,
} from '@zekuru-v2/entities';
import { BaseCacheRepository } from '../cache';

export class LanguageCacheRepository extends BaseCacheRepository<
  Language,
  LanguageCreateDto,
  LanguageUpdateDto
> {}
