import usage from './usage';
import translatorCache from '../cache/translatorCache';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';

jest.mock('../cache/translatorCache.ts');

describe('/usage command', () => {
  const mockTranslatorCache = jest.mocked(translatorCache);

  it(`should notify user if they're not signed in`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue(null as any);

    await usage.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if cannot get usage`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({ getUsage: () => ({}) } as any);

    await usage.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if limit reached`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({
      getUsage: () => ({
        character: {
          limitReached: () => true,
        },
      }),
    } as any);

    await usage.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should show usage`, async () => {
    const interaction = createMockInteraction();
    mockTranslatorCache.get.mockResolvedValue({
      getUsage: () => ({
        character: {
          count: 56789,
          limit: 500000,
          limitReached: () => false,
        },
      }),
    } as any);

    await usage.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
