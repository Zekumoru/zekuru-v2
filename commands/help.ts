import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createCommand } from '../types/DiscordCommand';

const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Shows the available commands of this bot.');

const execute = async (interaction: ChatInputCommandInteraction) => {
  interaction.reply({
    content: `Visit the [official Zekuru-v2 documentation](https://zekuru-v2.zekumoru.com/) for the list of all available commands!`,
  });
};

export default createCommand({
  data,
  execute,
});
