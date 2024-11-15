/* eslint-disable @typescript-eslint/no-explicit-any */
import set from '../../src/commands/set';
import {
  createMockChatInputCommandInteraction as createMockInteraction,
  createMockInteractionResponse,
} from '@zekuru-v2/test';
import { translateChannel as translateChannelCache } from '@zekuru-v2/cache';

jest.mock('@zekuru-v2/cache', () => require('@zekuru-v2/mocks/cache'));
jest.mock('@zekuru-v2/utils', () => require('@zekuru-v2/mocks/utils'));
jest.mock('../../src/events/utilities/updateTranslateMessages');

describe('/set command', () => {
  const mockTranslateChannelCache = jest.mocked(translateChannelCache);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should notify user that the command has been called outside of a server', async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await set.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they didn't provide the language to set the channel with`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue(null);

    await set.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they didn't provide correct language name`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('gibberish');

    await set.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if the provided language is missing its target language (DeepL)`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('English (GB)');

    await set.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should set language`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '000' } as any);
    interaction.options.getString.mockReturnValue('English');

    await set.execute(interaction);

    expect(mockTranslateChannelCache.set).toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should change language`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);
    interaction.options.getString.mockReturnValue('Japanese');
    const mockUpdate = jest.fn();
    interaction.reply.mockResolvedValue(
      createMockInteractionResponse(
        {},
        { customId: 'confirm', update: mockUpdate }
      )
    );

    await set.execute(interaction);

    expect(mockTranslateChannelCache.set).toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(mockUpdate.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should not change language if user cancelled`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);
    interaction.options.getString.mockReturnValue('Japanese');
    const mockUpdate = jest.fn();
    interaction.reply.mockResolvedValue(
      createMockInteractionResponse(
        {},
        { customId: 'cancel', update: mockUpdate }
      )
    );

    await set.execute(interaction);

    expect(mockTranslateChannelCache.set).not.toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(mockUpdate.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should not change language if timeout reached`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);
    interaction.options.getString.mockReturnValue('Japanese');
    interaction.reply.mockResolvedValue({
      awaitMessageComponent: jest.fn().mockImplementation(async () => {
        throw new Error('generic error');
      }),
    } as any);

    await set.execute(interaction);

    expect(mockTranslateChannelCache.set).not.toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(interaction.editReply.mock.calls[0][0]).toMatchSnapshot();
  });
});
