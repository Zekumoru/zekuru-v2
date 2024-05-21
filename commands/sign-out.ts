import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import translatorCache from '../cache/translatorCache';

const data = new SlashCommandBuilder()
  .setName('sign-out')
  .setDescription(
    `Signs out the bot removing the api key from the bot's server.`
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

  // if not signed in
  const translator = await translatorCache.get(interaction.guildId);
  if (translator == null) {
    await interaction.reply({
      content: `You are already signed out.`,
    });
    return;
  }

  // confirm signing out
  const confirm = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Yes, sign out')
    .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('No')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    cancel,
    confirm
  );

  const response = await interaction.reply({
    content: `Are you sure to sign out the bot? This will stop translating any further messages.`,
    components: [row],
  });

  try {
    const confirmation = await response.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30_000,
    });

    if (confirmation.customId === 'confirm') {
      await translatorCache.unset(interaction.guildId);
      await confirmation.update({
        content: `You have successfully signed out the bot.`,
        components: [],
      });
    } else if (confirmation.customId === 'cancel') {
      await confirmation.update({
        content: `Signing out has been cancelled.`,
        components: [],
      });
    }
  } catch (error) {
    await interaction.editReply({
      content: `Confirmation not received within 30 seconds, cancelling.`,
      components: [],
    });
  }
};

export default createCommand({
  data,
  execute,
});
