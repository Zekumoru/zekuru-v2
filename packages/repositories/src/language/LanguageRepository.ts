import {
  Language,
  LanguageCreateDto,
  LanguageUpdateDto,
} from '@zekuru-v2/entities';
import { CommonRepository } from '../CommonRepository';

export interface LanguageRepository
  extends CommonRepository<Language, LanguageCreateDto, LanguageUpdateDto> {
  findByApi(api: string): Promise<Language[]>;
}
