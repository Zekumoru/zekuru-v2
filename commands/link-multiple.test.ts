import { ChatInputCommandInteraction } from 'discord.js';
import linkMultiple from './link-multiple';
import { ITranslateChannel } from '../db/models/TranslateChannel';
import { IChannelLink } from '../db/models/ChannelLink';

const guildId = 'guild-id';
const sampleTranslateChannels: Omit<ITranslateChannel, '_id' | 'createdAt'>[] =
  [
    {
      id: '100',
      sourceLang: 'en',
      targetLang: 'en-US',
      guildId,
    },
    {
      id: '200',
      sourceLang: 'ja',
      targetLang: 'ja',
      guildId,
    },
    {
      id: '300',
      sourceLang: 'zh',
      targetLang: 'zh',
      guildId,
    },
    {
      id: '400',
      sourceLang: 'ko',
      targetLang: 'ko',
      guildId,
    },
  ];

const sampleChannelLinks: Omit<IChannelLink, '_id' | 'createdAt'>[] = [
  {
    guildId,
    id: '100',
    links: [],
  },
  {
    guildId,
    id: '200',
    links: [],
  },
  {
    guildId,
    id: '300',
    links: [],
  },
  {
    guildId,
    id: '400',
    links: [],
  },
];
const clearSampleChannelLinks = () => {
  sampleChannelLinks.forEach((chLink) =>
    chLink.links.splice(0, chLink.links.length)
  );
};

jest.mock('./utilities/linking', () => {
  const originalModule = jest.requireActual('./utilities/linking');
  return { ...originalModule, CHANNEL_LINK_LIMIT: 3 };
});

jest.mock('../cache', () => {
  return {
    translateChannel: {
      get: jest
        .fn()
        .mockImplementation(async (channelId) =>
          sampleTranslateChannels.find(
            (trChannel) => trChannel.id === channelId
          )
        ),
    },
    channelLink: {
      create: jest
        .fn()
        .mockImplementation(async (channelId) =>
          sampleChannelLinks.find((chLink) => chLink.id === channelId)
        ),
      get: jest
        .fn()
        .mockImplementation(async (channelId) =>
          sampleChannelLinks.find((chLink) => chLink.id === channelId)
        ),
      update: jest.fn(),
    },
  };
});

describe('/link-multiple command', () => {
  const createMockInteraction = (
    mockInteraction?: Partial<typeof ChatInputCommandInteraction.prototype> | {}
  ) => {
    return jest.mocked({
      guildId,
      reply: jest.fn(),
      options: {
        getString: jest.fn(),
      },
      ...mockInteraction,
    } as ChatInputCommandInteraction);
  };

  afterEach(() => {
    clearSampleChannelLinks();
    jest.clearAllMocks();
  });

  it('should notify user that the command has been called outside of a server', async () => {
    const interaction = createMockInteraction({ guildId: undefined });

    await linkMultiple.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it.each([['random string'], ['<@123456789>']])(
    `%s - should notify user if they didn't provide correct channels`,
    async (stringValue) => {
      const interaction = createMockInteraction();
      interaction.options.getString.mockReturnValue(stringValue);

      await linkMultiple.execute(interaction);

      expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    }
  );

  it.each([
    ['<#000>'],
    ['<#000> <#001>'],
    ['<#000> <#001> <#002> <#003> <#004>'],
  ])(
    `should notify user that they didn't provide a translate channel or translate channels`,
    async (stringValue) => {
      const interaction = createMockInteraction();
      interaction.options.getString.mockReturnValue(stringValue);

      await linkMultiple.execute(interaction);

      expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    }
  );

  it(`should notify user that they only provided one translate channel`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('<#100>');

    await linkMultiple.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });

  it(`should notify user that they reached linking limit`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue(
      '<#100> <#200> <#300> <#400>'
    );

    await linkMultiple.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
    expect(sampleChannelLinks[0].links).toHaveLength(0); // 100
    expect(sampleChannelLinks[1].links).toHaveLength(0); // 200
    expect(sampleChannelLinks[2].links).toHaveLength(0); // 300
    expect(sampleChannelLinks[3].links).toHaveLength(0); // 400
  });

  it(`should link channels up to the limit`, async () => {
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('<#100> <#200> <#300>');

    await linkMultiple.execute(interaction);

    expect(sampleChannelLinks[0].links).toEqual([
      sampleTranslateChannels[1],
      sampleTranslateChannels[2],
    ]); // 100 linked to: 200, 300
    expect(sampleChannelLinks[1].links).toEqual([
      sampleTranslateChannels[0],
      sampleTranslateChannels[2],
    ]); // 200 linked to: 100, 300
    expect(sampleChannelLinks[2].links).toEqual([
      sampleTranslateChannels[0],
      sampleTranslateChannels[1],
    ]); // 300 linked to: 100, 200
  });

  it(`it shouldn't link anymore if channels are already linked`, async () => {
    sampleChannelLinks[0].links = [
      sampleTranslateChannels[1],
      sampleTranslateChannels[2],
    ] as any;
    sampleChannelLinks[1].links = [
      sampleTranslateChannels[0],
      sampleTranslateChannels[2],
    ] as any;
    sampleChannelLinks[2].links = [
      sampleTranslateChannels[0],
      sampleTranslateChannels[1],
    ] as any;
    const interaction = createMockInteraction();
    interaction.options.getString.mockReturnValue('<#100> <#200> <#300>');

    await linkMultiple.execute(interaction);

    expect(sampleChannelLinks[0].links).toEqual([
      sampleTranslateChannels[1],
      sampleTranslateChannels[2],
    ]); // 100 linked to: 200, 300
    expect(sampleChannelLinks[1].links).toEqual([
      sampleTranslateChannels[0],
      sampleTranslateChannels[2],
    ]); // 200 linked to: 100, 300
    expect(sampleChannelLinks[2].links).toEqual([
      sampleTranslateChannels[0],
      sampleTranslateChannels[1],
    ]); // 300 linked to: 100, 200
  });

  it.each([
    ['<#100> <#400>'],
    ['<#200> <#300> <#400>'],
    ['<#100> <#200> <#300> <#400>'],
  ])(
    `%s - it shouldn't link anymore if the limit has already been reached`,
    async (stringValue) => {
      sampleChannelLinks[0].links = [
        sampleTranslateChannels[1],
        sampleTranslateChannels[2],
      ] as any;
      sampleChannelLinks[1].links = [
        sampleTranslateChannels[0],
        sampleTranslateChannels[2],
      ] as any;
      sampleChannelLinks[2].links = [
        sampleTranslateChannels[0],
        sampleTranslateChannels[1],
      ] as any;
      const interaction = createMockInteraction();
      interaction.options.getString.mockReturnValue(stringValue);

      await linkMultiple.execute(interaction);

      expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
      expect(sampleChannelLinks[0].links).toEqual([
        sampleTranslateChannels[1],
        sampleTranslateChannels[2],
      ]); // 100 linked to: 200, 300
      expect(sampleChannelLinks[1].links).toEqual([
        sampleTranslateChannels[0],
        sampleTranslateChannels[2],
      ]); // 200 linked to: 100, 300
      expect(sampleChannelLinks[2].links).toEqual([
        sampleTranslateChannels[0],
        sampleTranslateChannels[1],
      ]); // 300 linked to: 100, 200
    }
  );
});
