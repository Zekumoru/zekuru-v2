import { Language } from '@zekuru-v2/entities';
import {
  CacheManagerRepository,
  LanguageCacheRepository,
  LanguageMongoRepository,
} from '@zekuru-v2/repositories';

const languageCache = new CacheManagerRepository<Language>({
  ttl: 14 * 86_400_000, // 14 days
});

const languageRepository = new LanguageMongoRepository();

const LanguageCache = new LanguageCacheRepository(
  languageCache,
  languageRepository
);

export default LanguageCache;
