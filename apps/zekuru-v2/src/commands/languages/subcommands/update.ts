import { SlashCommandSubcommandBuilder } from 'discord.js';
import {
  createCodeOption,
  createLanguageOption,
  createSupportsOption,
  createVariantsOption,
} from '../options';

const updateLanguageSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('update')
    .setDescription('Update a supported language.')
    .addStringOption(createCodeOption().setRequired(true))
    .addStringOption(createLanguageOption())
    .addStringOption(createVariantsOption())
    .addStringOption(createSupportsOption());

export default updateLanguageSubcommand;
