import unlinkChannel from './unlink-channel';
import {
  resetSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '../cache/__mocks__/sample-data';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';
import cache from '../cache';

jest.mock('../cache');

describe('/unlink-channel command', () => {
  const mockCache = jest.mocked(cache);

  afterEach(() => {
    resetSampleChannelLinks();
    jest.clearAllMocks();
  });

  it(`should notify user that this command is only for servers`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await unlinkChannel.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user that the channel they provided isn't a translate channel`, async () => {
    const interaction = createMockInteraction({ channelId: '000' });

    await unlinkChannel.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user that the channel they provided isn't linked with any channels`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });

    await unlinkChannel.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should unlink the provided translate channel from all of its links`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);
    sampleChannelLinks[0].links = [
      sampleTranslateChannels[1],
      sampleTranslateChannels[2],
    ] as any;
    sampleChannelLinks[1].links = [
      sampleTranslateChannels[0],
      sampleTranslateChannels[2],
    ] as any;
    sampleChannelLinks[2].links = [
      sampleTranslateChannels[0],
      sampleTranslateChannels[1],
    ] as any;

    await unlinkChannel.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(mockCache.channelLink.update.mock.calls[0][0]).toMatchSnapshot();
    expect(mockCache.channelLink.update.mock.calls[1][0]).toMatchSnapshot();
    expect(mockCache.channelLink.update.mock.calls[2][0]).toMatchSnapshot();
    expect(mockCache.channelLink.delete.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toHaveLength(0);
    expect(sampleChannelLinks[1].links).not.toContain(
      sampleTranslateChannels[0]
    );
    expect(sampleChannelLinks[2].links).not.toContain(
      sampleTranslateChannels[0]
    );
  });
});
