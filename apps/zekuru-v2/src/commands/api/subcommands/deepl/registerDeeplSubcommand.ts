import { SlashCommandSubcommandBuilder } from 'discord.js';

const registerDeeplSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('deepl')
    .setDescription('Register with Deepl.')
    .addStringOption((option) =>
      option
        .setName('key')
        .setDescription(
          "Deepl's API key. The key you provide will be encrypted with SHA256."
        )
        .setRequired(true)
    );

export default registerDeeplSubcommand;
