/* eslint-disable @typescript-eslint/no-explicit-any */
import '@zekuru-v2/test/pino-disable';
import signIn from '../../src/commands/sign-in';
import { createMockChatInputCommandInteraction as createMockInteraction } from '@zekuru-v2/test';
import { translator as translatorCache } from '@zekuru-v2/cache';
import { AuthorizationError } from 'deepl-node';

jest.mock('@zekuru-v2/cache');

describe('/sign-in command', () => {
  const mockTranslatorCache = jest.mocked(translatorCache);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`should notify user that this command is only for servers`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await signIn.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they are already signed in`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({} as any);

    await signIn.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they didn't provide an API key`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue(null);

    await signIn.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if they passed an invalid API key`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('invalid key');
    mockTranslatorCache.set.mockImplementation(async () => {
      throw new AuthorizationError('Invalid API key!');
    });

    await signIn.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if something went wrong`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('valid key');
    mockTranslatorCache.set.mockImplementation(async () => {
      throw new Error('Generic error!');
    });

    await signIn.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should sign in`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('valid key');

    await signIn.execute(interaction);

    expect(mockTranslatorCache.set).toHaveBeenCalled();
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
