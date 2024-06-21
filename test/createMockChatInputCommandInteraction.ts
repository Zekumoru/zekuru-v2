import { ChatInputCommandInteraction, InteractionResponse } from 'discord.js';

const createMockChatInputCommandInteraction = (
  mockInteraction?: Partial<typeof ChatInputCommandInteraction.prototype> | {}
) => {
  return jest.mocked({
    guildId: 'guild-id',
    reply: jest.fn().mockResolvedValue({
      awaitMessageComponent: jest.fn(),
    } as Partial<InteractionResponse>),
    editReply: jest.fn(),
    options: {
      getString: jest.fn(),
      getChannel: jest.fn(),
    },
    ...mockInteraction,
  } as ChatInputCommandInteraction);
};

export default createMockChatInputCommandInteraction;
