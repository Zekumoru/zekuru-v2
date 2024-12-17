import { CacheRepository } from '@zekuru-v2/repositories';
import DeeplTranslator from '../translation/deepl/DeeplTranslator';
import GuildCache from './GuildCache';
import * as deepl from 'deepl-node';
import TranslatorCache from './TranslatorCache';
import { Snowflake } from '@zekuru-v2/types';
import { decrypt } from '@zekuru-v2/utils';

class DeeplTranslatorCache extends TranslatorCache<'deepl', DeeplTranslator> {
  constructor(cache: CacheRepository<DeeplTranslator>) {
    super(cache);
  }

  async get(guildId: Snowflake): Promise<DeeplTranslator | null> {
    const translator = await super.get(guildId);
    if (translator) return translator;

    const guild = await GuildCache.get(guildId);
    if (!guild) return null;

    const credential = guild.findCredential('deepl');
    if (!credential) return null;

    const decryptedKey = decrypt(credential.apiKey);
    this.set(guildId, new DeeplTranslator(new deepl.Translator(decryptedKey)));
    return await this.get(guildId);
  }
}

export default DeeplTranslatorCache;
