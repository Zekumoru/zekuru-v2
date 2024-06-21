import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import cache from '../cache';
import { unlinkChannel } from './utilities/unlinking';

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

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

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
    cache.channelLink.get(sourceChannelId),
    cache.channelLink.get(targetChannelId),
  ]);

  let errorMessage = '';
  if (sourceChannelId === targetChannelId) {
    errorMessage = `You cannot unlink <#${sourceChannelId}> with itself!`;
  } else if (!sourceChLink && !targetChLink) {
    errorMessage = `Both <#${sourceChannelId}> and <#${targetChannelId}> are not translate channels!`;
  } else if (!sourceChLink) {
    errorMessage = `<#${sourceChannelId}> is not a translate channel!`;
  } else if (!targetChLink) {
    errorMessage = `<#${targetChannelId}> is not a translate channel!`;
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
