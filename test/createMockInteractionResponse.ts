import { InteractionResponse } from 'discord.js';

const createMockInteractionResponse = (
  mockInteraction?: Partial<typeof InteractionResponse.prototype> | {},
  componentInteraction: Partial<{
    customId: 'confirm' | 'cancel' | (string & {});
    update: Function;
  }> = {
    update: jest.fn(),
  }
) => {
  return jest.mocked({
    awaitMessageComponent: jest.fn().mockResolvedValue(componentInteraction),
    ...mockInteraction,
  } as InteractionResponse);
};

export default createMockInteractionResponse;
