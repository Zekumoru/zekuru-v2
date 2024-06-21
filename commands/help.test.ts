import createMockInteraction from '../test/createMockChatInputCommandInteraction';
import help from './help';

describe('/help command', () => {
  it('should correctly show help content', async () => {
    const interaction = createMockInteraction();

    await help.execute(interaction);

    expect(interaction.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
