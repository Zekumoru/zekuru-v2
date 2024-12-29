import { SlashCommandSubcommandBuilder } from 'discord.js';
import {
  createCodeOption,
  createLanguageOption,
  createSupportsOption,
  createVariantsOption,
} from '../options';

const insertLanguageSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('insert')
    .setDescription('Insert a new supported language.')
    .addStringOption(createCodeOption().setRequired(true))
    .addStringOption(createLanguageOption().setRequired(true))
    .addStringOption(createVariantsOption().setRequired(true))
    .addStringOption(createSupportsOption().setRequired(true));

export default insertLanguageSubcommand;
