import { InteractionResponse } from 'discord.js';

export const createMockInteractionResponse = (
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  mockInteraction?: Partial<typeof InteractionResponse.prototype> | {},
  componentInteraction: Partial<{
    customId: 'confirm' | 'cancel' | (string & {});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
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
