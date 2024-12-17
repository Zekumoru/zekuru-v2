import { SlashCommandSubcommandBuilder } from 'discord.js';

const registerOpenAISubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('openai')
    .setDescription('Register with OpenAI.')
    .addStringOption((option) =>
      option
        .setName('key')
        .setDescription(
          "OpenAI's API key. The key you provide will be encrypted with SHA256."
        )
        .setRequired(true)
    );

export default registerOpenAISubcommand;
