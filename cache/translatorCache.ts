import * as deepl from 'deepl-node';
import * as openai from 'openai';
import { Collection } from 'discord.js';
import GuildKey, { IGuildKey } from '../db/models/GuildKey';
import { errorDebug } from '../utilities/logger';
import { decrypt, encrypt } from '../utilities/crypt';
import Translator, {
  ITranslatorKey,
  TranslatorType,
} from '../translation/translator';
import { AuthorizationError } from '../translation/error';
import { loadLanguages } from '../translation/languages';
import listToString from '../utilities/listToString';

const cacheTranslators = new Collection<string, Translator>();

const fetchOrCreateGuildKey = async (
  guildId: string,
  hashedKeys: ITranslatorKey[]
) => {
  // fetch from db, if not exists, create new
  const guildKey = await GuildKey.findOne({ id: guildId });
  if (guildKey) return [guildKey, false] as const;

  // save api key to db
  const newGuildKey = new GuildKey({
    id: guildId,
    keys: hashedKeys,
  });
  await newGuildKey.save();

  return [newGuildKey, true] as const;
};

const validateApiKeys = async (translator: Translator) => {
  const invalidKeys: TranslatorType[] = [];
  if (translator.deepl) {
    try {
      await translator.deepl.getUsage();
      await loadLanguages(translator.deepl);
    } catch (error) {
      if (error instanceof deepl.AuthorizationError) {
        invalidKeys.push('deepl');
      } else {
        errorDebug(error);
      }
    }
  }

  if (translator.openai) {
    try {
      await translator.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'Say A' }],
        max_tokens: 1,
      });
    } catch (error) {
      if (error instanceof openai.AuthenticationError) {
        invalidKeys.push('openai');
      } else {
        errorDebug(error);
      }
    }
  }

  if (invalidKeys.length === 0) return;
  throw new AuthorizationError(
    `Invalid key${invalidKeys.length === 1 ? '' : 's'} found: ${listToString(
      invalidKeys
    )}`
  );
};

const set = async (guildId: string, keys: ITranslatorKey[]) => {
  // create translator client
  const translator = new Translator(keys);

  // control if api keys are valid
  await validateApiKeys(translator);

  // encrypt api keys
  const encryptedKeys = keys.map<ITranslatorKey>(({ key, type }) => ({
    type,
    key: encrypt(key),
  }));

  // update in db
  const [guildKey, isNewlyCreated] = await fetchOrCreateGuildKey(
    guildId,
    encryptedKeys
  );

  if (!isNewlyCreated) {
    guildKey.overwrite({
      id: guildId,
      keys: encryptedKeys,
      preferredTranslator: guildKey.preferredTranslator,
      createdAt: guildKey.createdAt,
    } as IGuildKey);
    await guildKey.save();
  }

  // update cache
  cacheTranslators.set(guildId, translator);
};

const get = async (guildId: string) => {
  // get from cache
  const translatorCache = cacheTranslators.get(guildId);
  if (translatorCache) return translatorCache;

  // if not exists in cache, fetch from api key from db
  // then create new translator and set to cache
  const guildKey = await GuildKey.findOne({ id: guildId });
  if (!guildKey) return;

  try {
    const keys = guildKey.keys.map<ITranslatorKey>(({ key, type }) => ({
      type,
      key: decrypt(key),
    }));
    const translator = new Translator(keys);
    await validateApiKeys(translator);

    // update cache
    cacheTranslators.set(guildId, translator);
    return translator;
  } catch (error) {
    // remove invalid api key from db
    if (error instanceof AuthorizationError) {
      if (error.message.includes('deepl')) {
        guildKey.keys = guildKey.keys.filter((key) => key.type !== 'deepl');
      }
      if (error.message.includes('openai')) {
        guildKey.keys = guildKey.keys.filter((key) => key.type !== 'openai');
      }
      // if there are no keys, remove the document from db else save it and return
      if (guildKey.keys.length === 0) {
        await unset(guildId);
      } else {
        await guildKey.save();
        const translator = new Translator(guildKey.keys);
        cacheTranslators.set(guildId, translator);
        return translator;
      }
    }
  }
};

const unset = async (guildId: string) => {
  // check if it exists first
  if ((await get(guildId)) == null) return;

  // delete from db
  await GuildKey.deleteOne({ id: guildId });

  // remove from cache
  cacheTranslators.delete(guildId);
};

export default { set, unset, get };
