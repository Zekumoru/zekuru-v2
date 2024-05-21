import {
  AuthorizationError,
  SourceLanguageCode,
  TargetLanguageCode,
} from 'deepl-node';
import { DISCORD_MESSAGE_CHARS_LIMIT } from './limits';
import tagTranscoder from '../../utilities/tagTranscoder';
import cache from '../../cache';

const translateContent = async (
  content: string,
  guildId: string,
  sourceLang: SourceLanguageCode,
  targetLang: TargetLanguageCode
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

  const translatedContentToDecode = (
    await translator.translateText(messageToTranslate, sourceLang, targetLang)
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
