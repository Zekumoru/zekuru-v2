import { ITranslateChannel } from '../../db/models/TranslateChannel';
import { Language, codeLanguagesMap } from '../../translation/languages';

const getLanguagesFromTrChannels = (translateChannels: ITranslateChannel[]) => {
  const languages = translateChannels
    .map((trChannel) => codeLanguagesMap.get(trChannel.languageCode))
    .filter(Boolean) as Language[];

  return languages;
};

export default getLanguagesFromTrChannels;
