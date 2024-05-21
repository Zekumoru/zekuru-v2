import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import channelLinks from '../cache/channelLinks';
import { unlinkChannel } from './unlink';

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
  const channelId =
    interaction.options.getChannel('channel')?.id ?? interaction.channelId;

  const channelLink = await channelLinks.get(channelId);

  if (channelLink == null) {
    await interaction.reply({
      content: `<#${channelId}> is not linked with any channels!`,
    });
    return;
  }

  for (const { id } of channelLink.links) {
    const otherChannelLink = await channelLinks.get(id);
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
