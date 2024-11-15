import { createMockChatInputCommandInteraction } from '@zekuru-v2/test';
import help from '../../src/commands/help';

describe('/help command', () => {
  it('should correctly show help content', async () => {
    const interaction = createMockChatInputCommandInteraction();

    await help.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
