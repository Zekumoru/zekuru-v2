import { ChatInputCommandInteraction } from 'discord.js';
import help from './help';

describe('/help command', () => {
  it('should correctly show help content', async () => {
    const mockReply = jest.fn();
    const interaction = {
      reply: mockReply,
    } as unknown as ChatInputCommandInteraction;

    await help.execute(interaction);

    expect(mockReply.mock.calls[0][0]).toMatchSnapshot();
  });
});
