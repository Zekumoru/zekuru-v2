import { SlashCommandSubcommandBuilder } from 'discord.js';

const refreshOpenAISubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('openai')
    .setDescription("Refresh OpenAI's supported languages.");

export default refreshOpenAISubcommand;
