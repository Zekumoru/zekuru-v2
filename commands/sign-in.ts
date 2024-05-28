import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import { errorDebug } from '../utilities/logger';
import cache from '../cache';
import { AuthorizationError } from '../translation/error';
import { TranslatorType } from '../translation/translator';

const data = new SlashCommandBuilder()
  .setName('sign-in')
  .setDescription(`Sign in using a valid api key to start using the bot.`)
  .addStringOption((option) =>
    option
      .setName('api-type')
      .setDescription('The type of translation service to sign in with.')
      .addChoices(
        { name: 'DeepL', value: 'deepl' },
        { name: 'OpenAI', value: 'openai' }
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('api-key')
      .setDescription('The key will be encrypted with AES-256-GCM.')
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

  const apiType = interaction.options.getString('api-type') as TranslatorType;
  if (!apiType) {
    await interaction.reply({
      content: `Please specify the type of the api key.`,
    });
    return;
  }

  // if already signed in
  const translator = await cache.translator.get(interaction.guildId);
  if (apiType === 'deepl' && translator?.deepl) {
    await interaction.reply({
      content: `You are already signed in with DeepL. Please sign out using the \`/sign-out\` command if you wish to sign in with another API key.`,
    });
    return;
  }
  if (apiType === 'openai' && translator?.openai) {
    await interaction.reply({
      content: `You are already signed in with OpenAI. Please sign out using the \`/sign-out\` command if you wish to sign in with another API key.`,
    });
    return;
  }

  const apiKey = interaction.options.getString('api-key');
  if (!apiKey) {
    await interaction.reply({
      content: `Please provide the ${apiType} api key.`,
    });
    return;
  }

  try {
    if (!translator) {
      await cache.translator.set(interaction.guildId, [
        { type: apiType, key: apiKey },
      ]);
    } else {
      // it should be fine pushing a new api key without getting duplicates
      // because the checks should have happened already earlier in the get()
      translator.keys.push({ key: apiKey, type: apiType });
      await cache.translator.set(interaction.guildId, translator.keys);
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      await interaction.reply({
        content: `Could not sign in. ${error.message}`,
      });
      return;
    }

    errorDebug(error);
    await interaction.reply({
      content: `Could not sign in. Something went wrong!`,
    });
    return;
  }

  await interaction.reply({
    content: `Successfully signed in. You can now translate with ${apiType}!`,
  });
};

export default createCommand({
  data,
  execute,
});
