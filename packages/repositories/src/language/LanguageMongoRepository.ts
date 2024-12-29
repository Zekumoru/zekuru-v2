import {
  Language,
  LanguageCreateDto,
  LanguageUpdateDto,
} from '@zekuru-v2/entities';
import { BaseMongoRepository } from '../BaseMongoRepository';
import { LanguageModel } from '@zekuru-v2/db';
import { LanguageRepository } from './LanguageRepository';

export class LanguageMongoRepository
  extends BaseMongoRepository<Language, LanguageCreateDto, LanguageUpdateDto>
  implements LanguageRepository
{
  constructor() {
    super(LanguageModel);
  }

  findByApi(api: string): Promise<Language[]> {
    return this.model.find().where('supports').elemMatch({ $eq: api }).lean();
  }
}
