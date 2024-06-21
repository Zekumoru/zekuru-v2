import channelLinkCache from '../channelLinkCache';
import translateChannelCache from '../translateChannelCache';
import { sampleChannelLinks, sampleTranslateChannels } from './sample-data';

export = {
  translateChannel: {
    get: jest
      .fn()
      .mockImplementation(async (channelId) =>
        sampleTranslateChannels.find((trChannel) => trChannel.id === channelId)
      ),
    set: jest.fn(),
    unset: jest.fn(),
    clear: jest.fn(),
  } as typeof translateChannelCache,
  channelLink: {
    create: jest
      .fn()
      .mockImplementation(async (channelId) =>
        sampleChannelLinks.find((chLink) => chLink.id === channelId)
      ),
    get: jest
      .fn()
      .mockImplementation(async (channelId) =>
        sampleChannelLinks.find((chLink) => chLink.id === channelId)
      ),
    update: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  } as typeof channelLinkCache,
};
