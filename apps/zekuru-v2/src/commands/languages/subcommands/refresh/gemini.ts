import { SlashCommandSubcommandBuilder } from 'discord.js';

const refreshGeminiSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('gemini')
    .setDescription("Refresh Gemini's supported languages.");

export default refreshGeminiSubcommand;
