import { LanguageVariant } from '@zekuru-v2/entities';
import {
  ApiLanguagesCacheRepository,
  CacheManagerRepository,
  LanguageMongoRepository,
} from '@zekuru-v2/repositories';

const apiLanguagesCache = new CacheManagerRepository<LanguageVariant[]>({
  ttl: 24 * 60 * 60_000, // 1 day
});

const languageRepository = new LanguageMongoRepository();

const ApiLanguagesCache = new ApiLanguagesCacheRepository(
  apiLanguagesCache,
  languageRepository
);

export default ApiLanguagesCache;
