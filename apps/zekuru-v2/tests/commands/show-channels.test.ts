/* eslint-disable @typescript-eslint/no-explicit-any */
import showChannels from '../../src/commands/show-channels';
import { createMockChatInputCommandInteraction as createMockInteraction } from '@zekuru-v2/test';
import { TranslateChannel } from '@zekuru-v2/db';
import {
  clearSampleChannelLinks,
  resetSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '@zekuru-v2/test';

jest.mock('@zekuru-v2/cache', () => require('@zekuru-v2/mocks/cache'));
jest.mock('@zekuru-v2/db');
jest.mock('../../src/config.bot', () => ({
  config: { messageCharactersLimit: 500 },
}));

describe('/show-channels command', () => {
  const mockTranslateChannel = jest.mocked(TranslateChannel);

  afterEach(() => {
    clearSampleChannelLinks();
    jest.clearAllMocks();
  });

  it(`should notify user that this command is only on servers`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await showChannels.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user when they are no translate channels to show`, async () => {
    const interaction = createMockInteraction();
    mockTranslateChannel.find.mockResolvedValue([]);

    await showChannels.execute(interaction);

    expect(mockTranslateChannel.find).toHaveBeenCalledWith({
      guildId: interaction.guildId,
    });
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should show channels`, async () => {
    const interaction = createMockInteraction();
    mockTranslateChannel.find.mockResolvedValue(sampleTranslateChannels);
    sampleChannelLinks[0].links.push(sampleTranslateChannels[1] as any);
    sampleChannelLinks[0].links.push(sampleTranslateChannels[2] as any);
    sampleChannelLinks[1].links.push(sampleTranslateChannels[0] as any);
    sampleChannelLinks[1].links.push(sampleTranslateChannels[2] as any);
    sampleChannelLinks[2].links.push(sampleTranslateChannels[0] as any);
    sampleChannelLinks[2].links.push(sampleTranslateChannels[1] as any);

    await showChannels.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should show embeds instead if the message is over Discord's character limit`, async () => {
    const interaction = createMockInteraction();
    mockTranslateChannel.find.mockResolvedValue(sampleTranslateChannels);
    const guildId = sampleChannelLinks[0].guildId;
    sampleTranslateChannels.push({
      guildId,
      id: '000',
      sourceLang: 'it',
      targetLang: 'it',
    });
    sampleTranslateChannels.push({
      guildId,
      id: '001',
      sourceLang: 'fr',
      targetLang: 'fr',
    });
    sampleTranslateChannels.push({
      guildId,
      id: '002',
      sourceLang: 'es',
      targetLang: 'es',
    });

    await showChannels.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(interaction.reply.mock.calls[0][0]).toHaveProperty('embeds');
    resetSampleChannelLinks();
  });
});
