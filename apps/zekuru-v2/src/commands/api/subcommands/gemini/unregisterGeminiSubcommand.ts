import { SlashCommandSubcommandBuilder } from 'discord.js';

const unregisterGeminiSubcommand = (
  subcommand: SlashCommandSubcommandBuilder
) => subcommand.setName('gemini').setDescription('Unregister Gemini.');

export default unregisterGeminiSubcommand;
