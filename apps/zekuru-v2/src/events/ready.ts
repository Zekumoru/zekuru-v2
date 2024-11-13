import { GuildKey } from '@zekuru-v2/db';
import { Client, Events } from 'discord.js';
import { sourceLanguages } from 'packages/cache/src/discord/utils/languages';
import { translator as translatorCache } from '@zekuru-v2/cache';
import { logger } from '@zekuru-v2/utils';
import { DiscordEvent } from '@zekuru-v2/types';

export default {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client<true>) => {
    // try to load languages
    while (sourceLanguages.length === 0) {
      // load languages by selecting a random key
      const guildKey = await GuildKey.findOne({});
      // if no more keys found, break out the loop
      if (!guildKey) break;

      // fetching a translator already loads the languages
      const translator = await translatorCache.get(guildKey.id);
      if (translator) break;

      // if translator is undefined, it means the key is invalid
      // delete it from db so that we can fetch another random key
      await GuildKey.deleteOne({ id: guildKey.id });
    }

    logger.info(`Ready! Logged in as ${client.user.tag}.`);
  },
} as DiscordEvent;
