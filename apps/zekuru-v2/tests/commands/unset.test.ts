/* eslint-disable @typescript-eslint/no-explicit-any */
import unset from '../../src/commands/unset';
import { createMockChatInputCommandInteraction as createMockInteraction } from '@zekuru-v2/test';
import { translateChannel as translateChannelCache } from '@zekuru-v2/cache';

jest.mock('@zekuru-v2/cache', () => require('@zekuru-v2/mocks/cache'));

describe('/unset command', () => {
  const mockTranslateChannelCache = jest.mocked(translateChannelCache);

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

    expect(mockTranslateChannelCache.unset).not.toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should unset`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);

    await unset.execute(interaction);

    expect(mockTranslateChannelCache.unset).toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
