import { sampleChannelLinks, sampleTranslateChannels } from './sample-data';

export = {
  translateChannel: {
    get: jest
      .fn()
      .mockImplementation(async (channelId) =>
        sampleTranslateChannels.find((trChannel) => trChannel.id === channelId)
      ),
  },
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
  },
};
