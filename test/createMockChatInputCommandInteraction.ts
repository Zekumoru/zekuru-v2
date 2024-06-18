import { ChatInputCommandInteraction } from 'discord.js';

const createMockChatInputCommandInteraction = (
  mockInteraction?: Partial<typeof ChatInputCommandInteraction.prototype> | {}
) => {
  return jest.mocked({
    guildId: 'guild-id',
    reply: jest.fn(),
    options: {
      getString: jest.fn(),
    },
    ...mockInteraction,
  } as ChatInputCommandInteraction);
};

export default createMockChatInputCommandInteraction;
