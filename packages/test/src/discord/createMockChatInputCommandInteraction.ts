import { ChatInputCommandInteraction, InteractionResponse } from 'discord.js';

export const createMockChatInputCommandInteraction = (
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
