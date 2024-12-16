import { Snowflake } from '@zekuru-v2/types';
import DeeplTranslatorCache from '../cache/DeeplTranslatorCache';
import TranslatorCache from '../cache/TranslatorCache';
import Translator, { TranslatorTypes } from './Translator';
import {
  CacheManagerRepository,
  CacheRepository,
} from '@zekuru-v2/repositories';

export default class TranslatorManager {
  private static Constructors: Record<
    TranslatorTypes,
    new (
      cache: CacheRepository<Translator<TranslatorTypes>>
    ) => TranslatorCache<TranslatorTypes>
  > = {
    // If you're adding a new translation service, add one of its cache class here...
    deepl: DeeplTranslatorCache,
  };

  private translatorCache: Record<
    TranslatorTypes,
    TranslatorCache<TranslatorTypes> | undefined
  > = {
    // If you're adding a new translation service, add one of its cache here...
    deepl: undefined,
  };

  async get<TType extends TranslatorTypes>(
    type: TType,
    guildId: Snowflake
  ): Promise<Translator<TType> | null> {
    const cache = this.translatorCache[type];
    if (cache) {
      const translator = await cache.get(guildId);
      return translator;
    }

    this.translatorCache[type] = new TranslatorManager.Constructors[type](
      new CacheManagerRepository<Translator<TranslatorTypes>>({
        ttl: 14 * 86_400_000, // 14 days
      })
    );

    return this.translatorCache[type].get(guildId);
  }

  delete<TType extends TranslatorTypes>(type: TType): void {
    this.translatorCache[type] = undefined;
  }
}
