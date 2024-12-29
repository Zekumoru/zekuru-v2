import { ChannelLanguage, Language } from '@zekuru-v2/entities';

const getLanguageName = (
  language: Language,
  channelLanguage: ChannelLanguage
): string => {
  return language.variants.find(({ code }) => {
    const { variantCode, code: languageCode } = channelLanguage;
    return variantCode ? code === variantCode : code === languageCode;
  })?.name as string;
};

export default getLanguageName;
