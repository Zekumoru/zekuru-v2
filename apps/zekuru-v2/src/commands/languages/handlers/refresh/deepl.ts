import { ChatInputCommandInteraction } from 'discord.js';
import normalizeDeeplLanguagesToMap from './deepl/normalizeDeeplLanguagesToMap';
import createGroupMap from './deepl/createGroupMap';
import refreshDeeplLanguages from './deepl/refreshDeeplLanguages';
import * as deepl from 'deepl-node';

const deeplApiKey = process.env.DEEPL_API_KEY;

const refreshDeeplHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  if (!deeplApiKey) {
    await interaction.editReply(`DeepL API key is not specified in .env file.`);
    return;
  }

  const translator = new deepl.Translator(deeplApiKey);

  const sourceLanguages = await translator.getSourceLanguages();
  const targetLanguages = await translator.getTargetLanguages();

  const normalizedMap = normalizeDeeplLanguagesToMap(
    sourceLanguages,
    targetLanguages
  );

  const groupMap = createGroupMap(normalizedMap);
  const userId = interaction.user.id;

  await refreshDeeplLanguages(groupMap, userId);

  await interaction.editReply(
    `DeepL's supported languages has been successfully refreshed!`
  );
};

export default refreshDeeplHandler;
