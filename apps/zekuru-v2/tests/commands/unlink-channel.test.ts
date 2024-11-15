/* eslint-disable @typescript-eslint/no-explicit-any */
import unlinkChannel from '../../src/commands/unlink-channel';
import { createMockChatInputCommandInteraction as createMockInteraction } from '@zekuru-v2/test';
import {
  resetSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '@zekuru-v2/test';
import { channelLink as channelLinkCache } from '@zekuru-v2/cache';

jest.mock('@zekuru-v2/cache', () => require('@zekuru-v2/mocks/cache'));

describe('/unlink-channel command', () => {
  const mockChannelLinkCache = jest.mocked(channelLinkCache);

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
    expect(mockChannelLinkCache.update.mock.calls[0][0]).toMatchSnapshot();
    expect(mockChannelLinkCache.update.mock.calls[1][0]).toMatchSnapshot();
    expect(mockChannelLinkCache.update.mock.calls[2][0]).toMatchSnapshot();
    expect(mockChannelLinkCache.delete.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toHaveLength(0);
    expect(sampleChannelLinks[1].links).not.toContain(
      sampleTranslateChannels[0]
    );
    expect(sampleChannelLinks[2].links).not.toContain(
      sampleTranslateChannels[0]
    );
  });
});
