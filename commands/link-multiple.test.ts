import linkMultiple from './link-multiple';
import createMockInteraction from '../test/createMockChatInputCommandInteraction';
import {
  clearSampleChannelLinks,
  sampleChannelLinks,
  sampleTranslateChannels,
} from '../cache/__mocks__/sample-data';

jest.mock('./utilities/linking');
jest.mock('../cache');

describe('/link-multiple command', () => {
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
