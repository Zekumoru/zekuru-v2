import { SlashCommandSubcommandBuilder } from 'discord.js';

const unregisterDeeplSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand.setName('deepl').setDescription('Unregister Deepl.');

export default unregisterDeeplSubcommand;
