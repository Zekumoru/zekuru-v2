import { LanguageVariant } from '@zekuru-v2/entities';
import { CacheRepository } from '../cache';
import { LanguageRepository } from './LanguageRepository';
import { ApiType } from '@zekuru-v2/types';

export class ApiLanguagesCacheRepository
  implements Omit<CacheRepository<LanguageVariant[]>, 'has' | 'set'>
{
  constructor(
    private cache: CacheRepository<LanguageVariant[]>,
    private repository: LanguageRepository
  ) {}

  async clear(): Promise<void> {
    await this.cache.clear();
  }

  async delete(api: ApiType): Promise<void> {
    await this.cache.delete(api);
  }

  async get(api: ApiType): Promise<LanguageVariant[]> {
    const cached = await this.cache.get(api);
    if (cached) return cached;

    const languages = await this.repository.findByApi(api);
    const variants: LanguageVariant[] = [];
    languages.forEach(({ variants: languageVariants }) =>
      languageVariants.forEach((variant) => variants.push(variant))
    );

    this.cache.set(
      api,
      variants.sort((a, b) => a.name.localeCompare(b.name))
    );

    return variants;
  }
}
