/**
 * This file will update the old document model of type:
 *   id: string
 *   guildId: string
 *   sourceLang: deepl.SourceLanguageCode
 *   targetLang: deepl.TargetLanguageCode
 *   createdAt: Date
 * To the new model:
 *   id: string
 *   guildId: string
 *   languageCode: string
 *   createdAt: Date
 */

import 'dotenv/config';
import '../../db/mongoDbConnect';
import { appDebug } from '../../utilities/logger';
import GuildKey from '../models/GuildKey';

(async () => {
  const guildKeys = await GuildKey.find({});

  await Promise.all(
    guildKeys.map(async (guildKey) => {
      // typecast the old model
      const oldGuildKey = guildKey as unknown as {
        id: string;
        guildId: string;
        key: string;
        createdAt: Date;
      };

      // create new document from the new model
      const newGuildKey = new GuildKey({
        id: oldGuildKey.id,
        guildId: oldGuildKey.guildId,
        keys: [{ key: oldGuildKey.key, type: 'deepl' }],
        createdAt: oldGuildKey.createdAt,
      });
      await newGuildKey.save();

      // delete it
      await GuildKey.deleteOne({ id: oldGuildKey.id });
    })
  );

  appDebug('Finished updating GuildKey collection.');
})();
