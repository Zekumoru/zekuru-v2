import unset from './unset';
import cache from '../cache';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';

jest.mock('../cache');

describe('/unset command', () => {
  const mockCache = jest.mocked(cache);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it(`should notify user that the command is for servers only`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await unset.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they try to unset a channel that doesn't have a language yet`, async () => {
    const interaction = createMockInteraction({ channelId: '000' });

    await unset.execute(interaction);

    expect(cache.translateChannel.unset).not.toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should unset`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);

    await unset.execute(interaction);

    expect(cache.translateChannel.unset).toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
