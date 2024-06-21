import link, { LinkOptions } from './link';
import {
  clearSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '../cache/__mocks__/sample-data';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';

jest.mock('./utilities/linking');
jest.mock('../cache');

describe('link', () => {
  afterEach(() => {
    clearSampleChannelLinks();
    jest.clearAllMocks();
  });

  it('should notify user that the command has been called outside of a server', async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they didn't provide a translate channel`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they tried to link a channel to itself`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });
    interaction.options.getChannel.mockReturnValueOnce(null);
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they provided channels that aren't translate channels`, async () => {
    const interaction = createMockInteraction({ channelId: '000' });
    interaction.options.getChannel.mockReturnValueOnce(null);
    interaction.options.getChannel.mockReturnValueOnce({ id: '001' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they provided a source channel that is not a translate channel`, async () => {
    const interaction = createMockInteraction({ channelId: '000' });
    interaction.options.getChannel.mockReturnValueOnce(null);
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they provided a target channel that is not a translate channel`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });
    interaction.options.getChannel.mockReturnValueOnce(null);
    interaction.options.getChannel.mockReturnValueOnce({ id: '000' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should link the channel where the command is called on and the provided target channel`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });
    interaction.options.getChannel.mockReturnValueOnce(null);
    interaction.options.getChannel.mockReturnValueOnce({ id: '200' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toEqual([sampleTranslateChannels[1]]);
    expect(sampleChannelLinks[1].links).toEqual([sampleTranslateChannels[0]]);
  });

  it(`should link the provided source channel and the provided target channel`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);
    interaction.options.getChannel.mockReturnValueOnce({ id: '200' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toEqual([sampleTranslateChannels[1]]);
    expect(sampleChannelLinks[1].links).toEqual([sampleTranslateChannels[0]]);
  });

  it(`should not link if over the linking limit`, async () => {
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
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);
    interaction.options.getChannel.mockReturnValueOnce({ id: '400' } as any);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  test(`that unidirectional linking works`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);
    interaction.options.getChannel.mockReturnValueOnce({ id: '200' } as any);
    interaction.options.getString.mockReturnValue(
      LinkOptions.mode.UNIDIRECTIONAL
    );

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toContain(sampleTranslateChannels[1]);
    expect(sampleChannelLinks[1].links).not.toContain(
      sampleTranslateChannels[0]
    );
  });

  it(`should link if near the linking limit with recursive linking mode`, async () => {
    sampleChannelLinks[0].links = [sampleTranslateChannels[1]] as any;
    sampleChannelLinks[1].links = [sampleTranslateChannels[0]] as any;
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);
    interaction.options.getChannel.mockReturnValueOnce({ id: '300' } as any);
    interaction.options.getString.mockReturnValue(LinkOptions.mode.RECURSIVE);

    await link.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toContain(sampleTranslateChannels[2]);
    expect(sampleChannelLinks[1].links).toContain(sampleTranslateChannels[2]);
    expect(sampleChannelLinks[2].links).toEqual([
      sampleTranslateChannels[0],
      sampleTranslateChannels[1],
    ]);
  });
});
