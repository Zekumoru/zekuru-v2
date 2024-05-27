import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import cache from '../cache';
import {
  CHANNEL_LINK_LIMIT,
  buildAllChannelsLinkMap,
  getOrCreateChLink,
  linkChannel,
  linkChannels,
} from './utilities/linking';

const LinkOptions = {
  SOURCE_CHANNEL: 'source-channel',
  TARGET_CHANNEL: 'target-channel',
  MODE: 'mode',
  mode: {
    UNIDIRECTIONAL: 'unidirectional',
    BIDIRECTIONAL: 'bidirectional',
    RECURSIVE: 'recursive',
  },
};

const data = new SlashCommandBuilder()
  .setName('link')
  .setDescription('Links two translation channels.')
  .addChannelOption((option) =>
    option
      .setName(LinkOptions.TARGET_CHANNEL)
      .setDescription('The target channel to link.')
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName(LinkOptions.SOURCE_CHANNEL)
      .setDescription(
        'The source channel to link. If not provided, takes the current channel as the source.'
      )
  )
  .addStringOption((option) =>
    option
      .setName(LinkOptions.MODE)
      .setDescription('Specify linking mode. Default is bidirectional.')
      .addChoices(
        {
          name: LinkOptions.mode.UNIDIRECTIONAL,
          value: LinkOptions.mode.UNIDIRECTIONAL,
        },
        {
          name: LinkOptions.mode.BIDIRECTIONAL,
          value: LinkOptions.mode.BIDIRECTIONAL,
        },
        {
          name: LinkOptions.mode.RECURSIVE,
          value: LinkOptions.mode.RECURSIVE,
        }
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
    interaction.options.getChannel(LinkOptions.SOURCE_CHANNEL)?.id ??
    interaction.channelId;

  const targetChannelId = interaction.options.getChannel(
    LinkOptions.TARGET_CHANNEL
  )?.id;
  if (!targetChannelId) {
    await interaction.reply({
      content: `Please specify the target channel.`,
    });
    return;
  }

  const mode =
    interaction.options.getString(LinkOptions.MODE) ??
    LinkOptions.mode.BIDIRECTIONAL;

  // check if these channels have languages associated with them
  const [sourceTrChannel, targetTrChannel] = await Promise.all([
    cache.translateChannel.get(sourceChannelId),
    cache.translateChannel.get(targetChannelId),
  ]);

  let errorMessage = '';
  if (sourceChannelId === targetChannelId) {
    errorMessage = `You cannot link <#${sourceChannelId}> with itself!`;
  } else if (sourceTrChannel == null && targetTrChannel == null) {
    errorMessage = `Both <#${sourceChannelId}> and <#${targetChannelId}> are not associated with any languages yet. Please use the \`/set\` command to set their languages.`;
  } else if (sourceTrChannel == null) {
    errorMessage = `<#${sourceChannelId}> is not associated with any languages yet. Please use the \`/set\` command to set its language.`;
  } else if (targetTrChannel == null) {
    errorMessage = `<#${targetChannelId}> is not associated with any languages yet. Please use the \`/set\` command to set its language.`;
  }

  if (errorMessage || sourceTrChannel == null || targetTrChannel == null) {
    await interaction.reply({
      content: errorMessage,
    });
    return;
  }

  // add to their respective link documents
  const [sourceChLink, targetChLink] = await Promise.all([
    getOrCreateChLink(sourceChannelId, interaction.guildId),
    getOrCreateChLink(targetChannelId, interaction.guildId),
  ]);

  const allChLinkMap = await buildAllChannelsLinkMap([
    sourceChLink,
    targetChLink,
  ]);

  // don't link if reached linking limit
  if (allChLinkMap.size >= CHANNEL_LINK_LIMIT) {
    await interaction.reply({
      content: `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** and <#${targetChannelId}> **(${targetTrChannel.languageCode})** are **not linked** because you already reached the linking limit of ${CHANNEL_LINK_LIMIT}!`,
    });
    return;
  }

  let linked = false;

  // link unidirectional
  linked = await linkChannel(sourceChLink, targetChannelId, targetTrChannel);
  if (mode === LinkOptions.mode.UNIDIRECTIONAL) {
    await interaction.reply({
      content: linked
        ? `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** is now linked **unidirectionally** to <#${targetChannelId}> **(${targetTrChannel.languageCode})**!`
        : `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** is already linked with <#${targetChannelId}> **(${targetTrChannel.languageCode})**!`,
    });
    return;
  }

  // link bidirectional
  linked =
    (await linkChannel(targetChLink, sourceChannelId, sourceTrChannel)) ||
    linked;
  if (mode === LinkOptions.mode.BIDIRECTIONAL) {
    await interaction.reply({
      content: linked
        ? `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** and <#${targetChannelId}> **(${targetTrChannel.languageCode})** are now linked!`
        : `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** and <#${targetChannelId}> **(${targetTrChannel.languageCode})** are already linked!`,
    });
    return;
  }

  // link recursively
  // already add these to map to save time since they're already done as well
  // refetch channels links due to bidirectional linking
  allChLinkMap.set(sourceChLink.id, {
    chLink: await getOrCreateChLink(sourceChannelId, interaction.guildId),
    trChannel: sourceTrChannel,
  });
  allChLinkMap.set(targetChLink.id, {
    chLink: await getOrCreateChLink(targetChannelId, interaction.guildId),
    trChannel: targetTrChannel,
  });

  // start linking recursively O(n^2) [actually O(n^3) because of linkChannel()]
  linked = (await linkChannels(allChLinkMap)) || linked;

  await interaction.reply({
    content: linked
      ? `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** and <#${targetChannelId}> **(${targetTrChannel.languageCode})** are now linked **recursively**!`
      : `<#${sourceChannelId}> **(${sourceTrChannel.languageCode})** and <#${targetChannelId}> **(${targetTrChannel.languageCode})** are already linked **recursively**!`,
  });
};

export default createCommand({
  data,
  execute,
});
