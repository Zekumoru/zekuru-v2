import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import cache from '../cache';
import { unlinkChannel } from './utilities/unlinking';

const data = new SlashCommandBuilder()
  .setName('unlink-channel')
  .setDescription('Unlinks channel from all other translate channels.')
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription(
        'The channel to unlink all its links to other channels. If not provided, takes the current channel.'
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

  const channelId =
    interaction.options.getChannel('channel')?.id ?? interaction.channelId;

  const channelLink = await cache.channelLink.get(channelId);

  if (!channelLink) {
    await interaction.reply({
      content: `Cannot unlink! <#${channelId}> is not a translate channel!`,
    });
    return;
  }

  if (channelLink.links.length === 0) {
    await interaction.reply({
      content: `Cannot unlink! <#${channelId}> is not linked with any channels!`,
    });
    return;
  }

  for (const { id } of channelLink.links) {
    const otherChannelLink = await cache.channelLink.get(id);
    if (otherChannelLink) {
      // no need to delete the channelLink here, the
      // unlinkChannel() will already handle it.
      await unlinkChannel(otherChannelLink, channelLink.id);
      await unlinkChannel(channelLink, id);
    }
  }

  await interaction.reply({
    content: `<#${channelId}> is now unlinked!`,
  });
};

export default createCommand({
  data,
  execute,
});
