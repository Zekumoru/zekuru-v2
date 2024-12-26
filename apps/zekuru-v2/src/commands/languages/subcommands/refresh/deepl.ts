import { SlashCommandSubcommandBuilder } from 'discord.js';

const refreshDeeplSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('deepl')
    .setDescription("Refresh DeepL's supported languages.");

export default refreshDeeplSubcommand;
