import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import translatorCache from '../cache/translatorCache';
import { AuthorizationError } from 'deepl-node';
import { errorDebug } from '../utils/logger';

const data = new SlashCommandBuilder()
  .setName('sign-in')
  .setDescription(`Sign in using Deepl's api key to start using the bot.`)
  .addStringOption((option) =>
    option
      .setName('api-key')
      .setDescription('Deepl api key. The key will be encrypted with SHA256.')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

  // if already signed in
  if (await translatorCache.get(interaction.guildId)) {
    await interaction.reply({
      content: `You are already signed in. Please sign out using \`/sign-out\` command if you wish to sign in with another API key.`,
    });
    return;
  }

  const apiKey = interaction.options.getString('api-key');

  if (!apiKey) {
    await interaction.reply({
      content: `Please provide a Deepl API key.`,
    });
    return;
  }

  try {
    await translatorCache.set(interaction.guildId, apiKey);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      await interaction.reply({
        content: `Bot could not sign in. Invalid Deepl API key!`,
      });
      return;
    }

    errorDebug(error);
    await interaction.reply({
      content: `Bot could not sign in. Something went wrong!`,
    });
    return;
  }

  await interaction.reply({
    content: `Bot has been successfully signed in. You can now translate!`,
  });
};

export default createCommand({
  data,
  execute,
});
