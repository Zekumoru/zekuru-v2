/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  clearSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '@zekuru-v2/test';
import { createMockChatInputCommandInteraction as createMockInteraction } from '@zekuru-v2/test';
import showLinks from '../../src/commands/show-links';
import { ChannelLink } from '@zekuru-v2/db';

jest.mock('@zekuru-v2/cache', () => require('@zekuru-v2/mocks/cache'));
jest.mock('@zekuru-v2/db');
jest.mock('../../src/config.bot', () => ({
  config: { messageCharactersLimit: 250 },
}));

describe('/show-links command', () => {
  const mockChannelLinks = jest.mocked(ChannelLink);

  afterEach(() => {
    clearSampleChannelLinks();
    jest.clearAllMocks();
  });

  it(`should notify user that this command is only for servers`, async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await showLinks.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user if the translate channel they provided doesn't have any links yet`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);

    await showLinks.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should show links of a translate channel`, async () => {
    const interaction = createMockInteraction();
    sampleChannelLinks[0].links = [
      sampleTranslateChannels[1] as any,
      sampleTranslateChannels[2] as any,
    ];
    interaction.options.getChannel.mockReturnValue({ id: '100' } as any);

    await showLinks.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should show all links and use embeds if above Discord message's characters limit`, async () => {
    const interaction = createMockInteraction();
    sampleChannelLinks[0].links = [sampleTranslateChannels[1] as any];
    sampleChannelLinks[1].links = [sampleTranslateChannels[0] as any];
    sampleChannelLinks[2].links = [sampleTranslateChannels[3] as any];
    sampleChannelLinks[3].links = [sampleTranslateChannels[2] as any];
    const guildId = interaction.guildId;
    mockChannelLinks.find.mockReturnThis();
    mockChannelLinks.populate.mockResolvedValue(sampleChannelLinks as any);
    interaction.options.getChannel.mockReturnValue(null);

    await showLinks.execute(interaction);

    expect(mockChannelLinks.find).toHaveBeenCalledWith({ guildId });
    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(interaction.reply.mock.calls[0][0]).toHaveProperty('embeds');
  });
});
