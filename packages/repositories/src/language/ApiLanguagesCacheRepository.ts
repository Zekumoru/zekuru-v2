import { Language } from '@zekuru-v2/entities';
import { CacheRepository } from '../cache';
import { LanguageRepository } from './LanguageRepository';
import { ApiType } from '@zekuru-v2/types';

export class ApiLanguagesCacheRepository
  implements Omit<CacheRepository<Language[]>, 'has' | 'set'>
{
  constructor(
    private cache: CacheRepository<Language[]>,
    private repository: LanguageRepository
  ) {}

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async delete(api: ApiType): Promise<void> {
    await this.cache.delete(api);
  }

  async get(api: ApiType): Promise<Language[]> {
    const cached = await this.cache.get(api);
    if (cached) return cached;

    const languages = await this.repository.findByApi(api);
    this.cache.set(api, languages);

    return languages;
  }
}
