import { SlashCommandSubcommandBuilder } from 'discord.js';

const unregisterOpenAISubcommand = (
  subcommand: SlashCommandSubcommandBuilder
) => subcommand.setName('openai').setDescription('Unregister OpenAI.');

export default unregisterOpenAISubcommand;
