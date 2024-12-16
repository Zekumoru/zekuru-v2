import { CacheRepository } from '@zekuru-v2/repositories';
import Translator, { TranslatorTypes } from '../translation/Translator';
import { Snowflake } from '@zekuru-v2/types';

abstract class TranslatorCache<
  TType extends TranslatorTypes,
  TClass extends Translator<TType> = Translator<TType>
> implements CacheRepository<TClass>
{
  constructor(protected cache: CacheRepository<TClass>) {}

  async get(guildId: Snowflake): Promise<TClass | null> {
    const translator = await this.cache.get(guildId);
    if (translator) return translator;

    return null;
  }

  async set(guildId: Snowflake, translator: TClass): Promise<void> {
    this.cache.set(guildId, translator);
  }
}

export default TranslatorCache;
