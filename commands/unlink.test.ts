import unlink from './unlink';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';
import {
  sampleChannelLinks,
  sampleTranslateChannels,
} from '../cache/__mocks__/sample-data';

jest.mock('../cache');

describe('/unlink command', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should notify user that the command is only for servers`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await unlink.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user that they didn't provide a target channel`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });

    await unlink.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it.each([
    ['000', '000'],
    ['000', '001'],
    ['000', '100'],
    ['100', '000'],
    ['100', '100'],
  ])(
    `[%s, %s] - should notify user appropriately with regards to the state of the provided source and target channels`,
    async (sourceId, targetId) => {
      const interaction = createMockInteraction();
      interaction.options.getChannel.mockReturnValueOnce({
        id: sourceId,
      } as any);
      interaction.options.getChannel.mockReturnValueOnce({
        id: targetId,
      } as any);

      await unlink.execute(interaction);

      expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    }
  );

  it(`should notify user if the provided channels are already unlinked`, async () => {
    const interaction = createMockInteraction({ channelId: '100' });
    interaction.options.getChannel.mockReturnValueOnce(null);
    interaction.options.getChannel.mockReturnValueOnce({ id: '200' } as any);

    await unlink.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should unlink`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValueOnce({ id: '100' } as any);
    interaction.options.getChannel.mockReturnValueOnce({ id: '200' } as any);
    sampleChannelLinks[0].links.push(sampleTranslateChannels[1] as any);
    sampleChannelLinks[1].links.push(sampleTranslateChannels[0] as any);

    await unlink.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).not.toContain(sampleChannelLinks[1]);
    expect(sampleChannelLinks[1].links).not.toContain(sampleChannelLinks[0]);
  });
});
