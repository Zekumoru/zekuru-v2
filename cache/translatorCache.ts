import { AuthorizationError, Translator, TranslatorOptions } from 'deepl-node';
import { Collection } from 'discord.js';
import GuildKey, { IGuildKey } from '../models/GuildKey';
import { loadLanguages } from '../translation/languages';
import { errorDebug } from '../utils/logger';
import { decrypt, encrypt } from '../utils/crypt';

export const translatorOptions: TranslatorOptions = {
  appInfo: {
    appName: 'Zekuru-v2 Demo',
    appVersion: '1.0.0',
  },
  minTimeout: 500, // 500 ms
  maxRetries: 10,
};

const cacheTranslators = new Collection<string, Translator>();

const fetchOrCreateGuildKey = async (guildId: string, hashedApiKey: string) => {
  // fetch from db, if not exists, create new
  const guildKey = await GuildKey.findOne({ id: guildId });
  if (guildKey) return [guildKey, false] as const;

  // save api key to db
  const newGuildKey = new GuildKey({
    id: guildId,
    key: hashedApiKey,
  });
  await newGuildKey.save();

  return [newGuildKey, true] as const;
};

const set = async (guildId: string, apiKey: string) => {
  // create translator client
  const translator = new Translator(apiKey, translatorOptions);

  // this should throw error if invalid api key
  await translator.getUsage();
  await loadLanguages(translator);

  // encrypt api key
  const encryptedApiKey = encrypt(apiKey);

  // update in db
  const [guildKey, isNewlyCreated] = await fetchOrCreateGuildKey(
    guildId,
    encryptedApiKey
  );

  if (!isNewlyCreated) {
    guildKey.overwrite({
      id: guildId,
      key: encryptedApiKey,
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
    const apiKey = decrypt(guildKey.key);
    const translator = new Translator(apiKey, translatorOptions);

    // load languages
    await loadLanguages(translator);

    // update cache
    cacheTranslators.set(guildId, translator);
    return translator;
  } catch (error) {
    // delete invalid api key from db and "sign out" user by removing it from cache
    if (error instanceof AuthorizationError) {
      await unset(guildId);
    }
    errorDebug(error);
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
