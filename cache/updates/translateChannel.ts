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
import TranslateChannel from '../../db/models/TranslateChannel';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import { appDebug } from '../../utilities/logger';

(async () => {
  const channels = await TranslateChannel.find({});

  await Promise.all(
    channels.map(async (channel) => {
      // typecast the old model
      const oldChannel = channel as unknown as {
        id: string;
        guildId: string;
        sourceLang: SourceLanguageCode;
        targetLang: TargetLanguageCode;
        createdAt: Date;
      };

      // create new document from the new model
      const newChannel = new TranslateChannel({
        id: oldChannel.id,
        guildId: oldChannel.guildId,
        languageCode: oldChannel.sourceLang as string,
        createdAt: oldChannel.createdAt,
      });
      await newChannel.save();

      // delete it
      await TranslateChannel.deleteOne({ id: oldChannel.id });
    })
  );

  appDebug('Finished updating TranslateChannel collection.');
})();
