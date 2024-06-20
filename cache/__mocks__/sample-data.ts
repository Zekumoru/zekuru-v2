import { IChannelLink } from '../../db/models/ChannelLink';
import { ITranslateChannel } from '../../db/models/TranslateChannel';

const guildId = 'guild-id';

export const sampleTranslateChannels: Omit<
  ITranslateChannel,
  '_id' | 'createdAt'
>[] = [];

export const resetSampleTranslateChannels = () => {
  sampleTranslateChannels.splice(0, sampleTranslateChannels.length);
  sampleTranslateChannels.push({
    id: '100',
    sourceLang: 'en',
    targetLang: 'en-US',
    guildId,
  });
  sampleTranslateChannels.push({
    id: '200',
    sourceLang: 'ja',
    targetLang: 'ja',
    guildId,
  });
  sampleTranslateChannels.push({
    id: '300',
    sourceLang: 'zh',
    targetLang: 'zh',
    guildId,
  });
  sampleTranslateChannels.push({
    id: '400',
    sourceLang: 'ko',
    targetLang: 'ko',
    guildId,
  });
};

export const sampleChannelLinks: Omit<IChannelLink, '_id' | 'createdAt'>[] = [];

export const resetSampleChannelLinks = () => {
  sampleChannelLinks.splice(0, sampleChannelLinks.length);
  sampleChannelLinks.push({
    guildId,
    id: '100',
    links: [],
  });
  sampleChannelLinks.push({
    guildId,
    id: '200',
    links: [],
  });
  sampleChannelLinks.push({
    guildId,
    id: '300',
    links: [],
  });
  sampleChannelLinks.push({
    guildId,
    id: '400',
    links: [],
  });
};

export const clearSampleChannelLinks = () => {
  sampleChannelLinks.forEach((chLink) =>
    chLink.links.splice(0, chLink.links.length)
  );
};

resetSampleTranslateChannels();
resetSampleChannelLinks();
