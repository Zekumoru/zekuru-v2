import { SlashCommandSubcommandBuilder } from 'discord.js';
import { createCodeOption } from '../options';

const queryLanguageSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('query')
    .setDescription('Query a supported language.')
    .addStringOption(createCodeOption().setRequired(true));

export default queryLanguageSubcommand;
