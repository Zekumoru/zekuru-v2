import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import channelLinks from '../cache/channelLinks';
import { IChannelLink } from '../models/ChannelLink';

const UnlinkOptions = {
  SOURCE_CHANNEL: 'source-channel',
  TARGET_CHANNEL: 'target-channel',
};

const data = new SlashCommandBuilder()
  .setName('unlink')
  .setDescription('Unlinks two translation channels.')
  .addChannelOption((option) =>
    option
      .setName(UnlinkOptions.TARGET_CHANNEL)
      .setDescription('The target channel to unlink.')
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName(UnlinkOptions.SOURCE_CHANNEL)
      .setDescription(
        'The source channel to unlink. If not provided, takes the current channel as the source.'
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export const unlinkChannel = async (
  channelLink: IChannelLink,
  channelId: string
) => {
  if (channelLink.links.find((link) => link.id === channelId)) {
    channelLink.links = channelLink.links.filter(
      (trChannel) => trChannel.id !== channelId
    );

    if (channelLink.links.length === 0) {
      // remove channelLink since it doesn't have any links anymore
      // because it cannot be called "channelLink" with no links
      await channelLinks.delete(channelLink.id);
    } else {
      await channelLinks.update(channelLink);
    }

    return true;
  }
  return false;
};

const execute = async (interaction: ChatInputCommandInteraction) => {
  const sourceChannelId =
    interaction.options.getChannel(UnlinkOptions.SOURCE_CHANNEL)?.id ??
    interaction.channelId;

  const targetChannelId = interaction.options.getChannel(
    UnlinkOptions.TARGET_CHANNEL
  )?.id;
  if (!targetChannelId) {
    await interaction.reply({
      content: `Please specify the target channel.`,
    });
    return;
  }

  const [sourceChLink, targetChLink] = await Promise.all([
    channelLinks.get(sourceChannelId),
    channelLinks.get(targetChannelId),
  ]);

  let errorMessage = '';
  if (sourceChannelId === targetChannelId) {
    errorMessage = `You cannot unlink <#${sourceChannelId}> with itself!`;
  } else if (sourceChLink == null && targetChLink == null) {
    errorMessage = `Both <#${sourceChannelId}> and <#${targetChannelId}> are not linked with any channels!`;
  } else if (sourceChLink == null) {
    errorMessage = `<#${sourceChannelId}> is not linked with any channels!`;
  } else if (targetChLink == null) {
    errorMessage = `<#${targetChannelId}> is not linked with any channels!`;
  }

  if (errorMessage || sourceChLink == null || targetChLink == null) {
    await interaction.reply({
      content: errorMessage,
    });
    return;
  }

  // unlink bidirectional
  let unlinked = (
    await Promise.all([
      unlinkChannel(sourceChLink, targetChannelId),
      unlinkChannel(targetChLink, sourceChannelId),
    ])
  ).reduce((v1, v2) => v1 || v2);

  await interaction.reply({
    content: unlinked
      ? `<#${sourceChannelId}> and <#${targetChannelId}> are now unlinked!`
      : `<#${sourceChannelId}> and <#${targetChannelId}> are already unlinked!`,
  });
};

export default createCommand({
  data,
  execute,
});
