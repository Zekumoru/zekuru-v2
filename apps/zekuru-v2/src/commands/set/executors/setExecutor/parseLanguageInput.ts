import { ChannelLanguage } from '@zekuru-v2/entities';

const parseLanguageInput = (input: string): ChannelLanguage => {
  const channelLanguage: ChannelLanguage = { code: input };

  const index = channelLanguage.code.indexOf('-');
  if (index >= 0) {
    channelLanguage.variantCode = channelLanguage.code;
    channelLanguage.code = channelLanguage.code.slice(0, index);
  }

  return channelLanguage;
};

export default parseLanguageInput;
