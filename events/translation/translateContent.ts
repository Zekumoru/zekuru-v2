import { AuthorizationError } from 'deepl-node';
import { DISCORD_MESSAGE_CHARS_LIMIT } from './limits';
import tagTranscoder from '../../utilities/tagTranscoder';
import cache from '../../cache';
import languagesMap from '../../translation/languages';

const translateContent = async (
  content: string,
  guildId: string,
  sourceLanguageCode: string,
  targetLanguageCode: string
) => {
  if (content.trim() === '') return;

  // because Discord has 2K characters limit, trim it to 2K
  const userReachedLimit = content.length > DISCORD_MESSAGE_CHARS_LIMIT;
  let toTranslate = userReachedLimit
    ? content.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
    : content;

  const [messageToTranslate, tagTable] = tagTranscoder.encode(toTranslate);

  const translator = await cache.translator.get(guildId);
  if (!translator) throw new AuthorizationError('Invalid api key');

  const sourceLanguage = languagesMap.find(
    (lang) => lang.code === sourceLanguageCode
  );
  if (!sourceLanguage) {
    throw new Error(
      `Could not find language object for '${sourceLanguageCode}'.`
    );
  }
  if (!sourceLanguage.deepl) {
    throw new Error(`Deepl doesn't support '${sourceLanguage.name}' yet.`);
  }

  const targetLanguage = languagesMap.find(
    (lang) => lang.code === targetLanguageCode
  );
  if (!targetLanguage) {
    throw new Error(
      `Could not find language object for '${targetLanguageCode}'.`
    );
  }
  if (!targetLanguage.deepl) {
    throw new Error(`Deepl doesn't support '${targetLanguage.name}' yet.`);
  }

  const translatedContentToDecode = (
    await translator.translateText(
      messageToTranslate,
      sourceLanguage.deepl.sourceCode,
      targetLanguage.deepl.targetCode
    )
  ).text;

  const translatedContent = tagTranscoder.decode(
    translatedContentToDecode,
    tagTable
  );

  // check if the translated content reached limit
  const botReachedLimit =
    translatedContent.length > DISCORD_MESSAGE_CHARS_LIMIT;
  return {
    content: botReachedLimit
      ? translatedContent.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
      : translatedContent,
    userReachedLimit,
    botReachedLimit,
  };
};

export default translateContent;
