import botConfig from '../botConfig';
import {
  clearSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '../cache/__mocks__/sample-data';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';
import showLinks from './show-links';
import ChannelLink from '../db/models/ChannelLink';

jest.mock('../cache');
jest.mock('../db/models/ChannelLink.ts');
jest.mock(
  '../botConfig.ts',
  () =>
    ({
      messageCharactersLimit: 250,
    } as typeof botConfig)
);

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
