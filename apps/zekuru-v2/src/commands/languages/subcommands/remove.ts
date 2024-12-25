import { SlashCommandSubcommandBuilder } from 'discord.js';
import { createCodeOption } from '../options';

const removeLanguageSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('remove')
    .setDescription('Remove a supported language.')
    .addStringOption(createCodeOption().setRequired(true));

export default removeLanguageSubcommand;
