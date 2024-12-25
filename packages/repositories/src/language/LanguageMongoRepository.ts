import {
  Language,
  LanguageCreateDto,
  LanguageUpdateDto,
} from '@zekuru-v2/entities';
import { BaseMongoRepository } from '../BaseMongoRepository';
import { LanguageModel } from '@zekuru-v2/db';

export class LanguageMongoRepository extends BaseMongoRepository<
  Language,
  LanguageCreateDto,
  LanguageUpdateDto
> {
  constructor() {
    super(LanguageModel);
  }
}
