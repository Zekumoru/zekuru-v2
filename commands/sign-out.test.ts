import signOut from './sign-out';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';
import translatorCache from '../cache/translatorCache';
import createMockInteractionResponse from '../test/createMockInteractionResponse';

jest.mock('../cache/translatorCache');

describe('/sign-out command', () => {
  const mockTranslatorCache = jest.mocked(translatorCache);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should notify user that this command is only for servers`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await signOut.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user that they're already signed out`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue(null as any);

    await signOut.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should not sign out if cancelled`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({} as any);
    const mockUpdate = jest.fn();
    interaction.reply.mockResolvedValue(
      createMockInteractionResponse(
        {},
        { customId: 'cancel', update: mockUpdate }
      )
    );

    await signOut.execute(interaction);

    expect(mockTranslatorCache.unset).not.toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(mockUpdate.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should not sign out if timed out`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({} as any);
    interaction.reply.mockResolvedValue({
      awaitMessageComponent: jest.fn().mockImplementation(() => {
        throw new Error('Generic error!');
      }),
    } as any);

    await signOut.execute(interaction);

    expect(mockTranslatorCache.unset).not.toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(interaction.editReply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should sign out`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({} as any);
    const mockUpdate = jest.fn();
    interaction.reply.mockResolvedValue(
      createMockInteractionResponse(
        {},
        { customId: 'confirm', update: mockUpdate }
      )
    );

    await signOut.execute(interaction);

    expect(mockTranslatorCache.unset).toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(mockUpdate.mock.calls[0][0]).toMatchSnapshot();
  });
});
