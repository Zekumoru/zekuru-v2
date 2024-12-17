import { SlashCommandSubcommandBuilder } from 'discord.js';

const registerGeminiSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('gemini')
    .setDescription("Register with Google's Gemini.")
    .addStringOption((option) =>
      option
        .setName('key')
        .setDescription(
          "Gemini's API key. The key you provide will be encrypted with SHA256."
        )
        .setRequired(true)
    );

export default registerGeminiSubcommand;
