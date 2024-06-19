import { IChannelLink } from '../../db/models/ChannelLink';
import { ITranslateChannel } from '../../db/models/TranslateChannel';

const guildId = 'guild-id';

export const sampleTranslateChannels: Omit<
  ITranslateChannel,
  '_id' | 'createdAt'
>[] = [
  {
    id: '100',
    sourceLang: 'en',
    targetLang: 'en-US',
    guildId,
  },
  {
    id: '200',
    sourceLang: 'ja',
    targetLang: 'ja',
    guildId,
  },
  {
    id: '300',
    sourceLang: 'zh',
    targetLang: 'zh',
    guildId,
  },
  {
    id: '400',
    sourceLang: 'ko',
    targetLang: 'ko',
    guildId,
  },
];

export const sampleChannelLinks: Omit<IChannelLink, '_id' | 'createdAt'>[] = [
  {
    guildId,
    id: '100',
    links: [],
  },
  {
    guildId,
    id: '200',
    links: [],
  },
  {
    guildId,
    id: '300',
    links: [],
  },
  {
    guildId,
    id: '400',
    links: [],
  },
];

export const clearSampleChannelLinks = () => {
  sampleChannelLinks.forEach((chLink) =>
    chLink.links.splice(0, chLink.links.length)
  );
};
