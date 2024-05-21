import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import cache from '../cache';

const data = new SlashCommandBuilder()
  .setName('unset')
  .setDescription(`Unset a channel's language`)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription(
        'The channel to unset the language of. If not specified, defaults to current channel.'
      )
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  const channelId =
    interaction.options.getChannel('channel')?.id ?? interaction.channelId;

  const trChannel = await cache.translateChannel.get(channelId);
  if (!trChannel) {
    await interaction.reply({
      content: `<#${channelId}> is not set to any language.`,
    });
    return;
  }

  await cache.translateChannel.unset(channelId);
  await interaction.reply({
    content: `<#${channelId}> has been successfully unset.`,
  });
};

export default createCommand({
  data,
  execute,
});
