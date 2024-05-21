import { Client, Events } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import { appDebug, errorDebug } from '../utils/logger';
import { sourceLanguages } from '../translation/languages';
import GuildKey from '../models/GuildKey';
import { decrypt } from '../utils/crypt';
import { Translator } from 'deepl-node';
import translatorCache from '../cache/translatorCache';

export default {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client<true>) => {
    // try to load languages
    while (sourceLanguages.length === 0) {
      // load languages by selecting a random key
      let guildKey = await GuildKey.findOne({});
      // if no more keys found, break out the loop
      if (!guildKey) break;

      // fetching a translator already loads the languages
      const translator = await translatorCache.get(guildKey.id);
      if (translator) break;

      // if translator is undefined, it means the key is invalid
      // delete it from db so that we can fetch another random key
      await GuildKey.deleteOne({ id: guildKey.id });
    }

    appDebug(`Ready! Logged in as ${client.user.tag}.`);
  },
} as DiscordEvent;
