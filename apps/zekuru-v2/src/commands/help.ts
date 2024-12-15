import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import fs from 'fs/promises';
import path from 'path';

const loadHelpContent = (() => {
  let content: string | undefined;

  return async () => {
    if (content) return content;

    content = await fs.readFile(path.join(__dirname, '../assets/help.md'), {
      encoding: 'utf-8',
    });

    return content;
  };
})();

const helpCommand = new DiscordCommandBuilder()
  .setName('help')
  .setDescription('Shows the available commands of this bot.')
  .setExecutor(async (interaction) => {
    interaction.reply({ content: await loadHelpContent() });
  });

export default helpCommand;
