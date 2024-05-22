import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createCommand } from '../types/DiscordCommand';

const content = `
# Help
Start using the bot by signing in using the \`/sign-in\` command providing your Deepl API key which you can get from [Deepl's website](https://www.deepl.com/pro-api). Then set languages to your channels using the \`/set\` command, link them using the \`/link\` command, and finally start chatting!

For a more elaborate setup instructions, please visit the [Getting Started page on the official Zekuru-v2 documentation](https://zekuru-v2.zekumoru.com/getting-started/adding-to-server/)!
## Commands
- \`/sign-in\`: Sign in using a Deepl's API key to start using the bot.
- \`/sign-out\`: Signs out the bot.
- \`/usage\`: Shows the current usage and remaining characters.
- \`/set\`: Sets a channel's language.
- \`/unset\`: Unset a channel's language.
- \`/link\`: Links two translate channels unidirectionally, bidirectionally, or recursively.
- \`/link-multiple\`: Links multiple channels at once.
- \`/unlink\`: Unlinks two translate channels.
- \`/unlink-channel\`: Unlinks channel from all other translate channels.
- \`/show-channels\`: Shows a list of all translate channels.
- \`/show-links\`: Shows the linking of translate channels.

You can learn more about these commands in the [official Zekuru-v2 documentation](https://zekuru-v2.zekumoru.com/)!
`;

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows the available commands of this bot.');

const execute = async (interaction: ChatInputCommandInteraction) => {
  interaction.reply({ content });
};

export default createCommand({
  data,
  execute,
});
