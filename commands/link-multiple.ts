import {
  ChatInputCommandInteraction,
  Collection,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import translateChannels from '../cache/translateChannels';
import {
  CHANNEL_LINK_LIMIT,
  IAllChLinkMapValue,
  buildAllChannelsLinkMap,
  getChLink,
  linkChannels,
} from './link';

const CHANNEL_ID_REGEX = /<#\d*>/g;

const data = new SlashCommandBuilder()
  .setName('link-multiple')
  .setDescription('Link multiple channels at once.')
  .addStringOption((option) =>
    option
      .setName('channels')
      .setDescription(
        `List of channels to link. E.g. '#channel1 #channel2 ... #channelN'`
      )
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const stringChannels = (channelIds: string[]) => {
  const strBuilder: string[] = [];
  channelIds.forEach((channelId, i) => {
    strBuilder.push(`<#${channelId}>`);
    if (i === channelIds.length - 2) strBuilder.push(' and ');
    else if (i !== channelIds.length - 1) strBuilder.push(', ');
  });

  return strBuilder.join('');
};

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

  const channelsRaw = interaction.options.getString('channels');
  // get channels
  const channelTags = channelsRaw?.match(CHANNEL_ID_REGEX);

  if (!channelsRaw || !channelTags) {
    interaction.reply({
      content: `Cannot link, you didn't provide any channels!`,
    });
    return;
  }

  // map for storing ids that aren't language channels to tell the user
  const nonTrChannelIdsMap = new Collection<string, boolean>();

  const chProcessMap = new Collection<string, IAllChLinkMapValue>();
  await Promise.all(
    channelTags.map(async (channelTag) => {
      const channelId = channelTag.slice(2, channelTag.length - 1);
      if (chProcessMap.get(channelId)) return; // ignore if already added
      if (nonTrChannelIdsMap.get(channelId)) return; // ignore if already added

      const trChannel = await translateChannels.get(channelId);
      if (!trChannel) {
        nonTrChannelIdsMap.set(channelId, true);
        return;
      }

      if (!interaction.guildId) return;
      const chLink = await getChLink(channelId, interaction.guildId);
      chProcessMap.set(channelId, {
        trChannel,
        chLink,
      });
    })
  );

  const nonTrChannelsWarning = nonTrChannelIdsMap.size
    ? `\n${stringChannels(
        nonTrChannelIdsMap.map((_, channelId) => channelId)
      )} ${
        nonTrChannelIdsMap.size === 1 ? 'is' : 'are'
      } not linked because they are not set to any language. Please use the \`/set\` command to specify ${
        nonTrChannelIdsMap.size === 1 ? 'its language' : 'their languages'
      }.`
    : '';

  if (chProcessMap.size <= 1) {
    interaction.reply({
      content: `Cannot link, ${
        chProcessMap.size === 0
          ? `you didn't provide any translate channels!`
          : `please provide more than one translate channel!`
      }${nonTrChannelsWarning}`,
    });
    return;
  }

  const linkedChannelsString = stringChannels(
    chProcessMap.map((_, channelId) => channelId)
  );

  // don't link if reached linking limit
  const allChLinkMap = await buildAllChannelsLinkMap(
    Array.from(chProcessMap, ([_key, item]) => item.chLink)
  );
  if (
    allChLinkMap.size >= CHANNEL_LINK_LIMIT ||
    chProcessMap.size >= CHANNEL_LINK_LIMIT
  ) {
    await interaction.reply({
      content: `${linkedChannelsString} are **not linked** because you already reached the linking limit of ${CHANNEL_LINK_LIMIT}!`,
    });
    return;
  }

  // start linking O(n^2) [actual O(n^3) because of linking checks]
  const linked = await linkChannels(chProcessMap);

  if (!linked) {
    interaction.reply({
      content: `${linkedChannelsString} are already linked!${nonTrChannelsWarning}`,
    });
    return;
  }

  interaction.reply({
    content: `${linkedChannelsString} are now linked!${nonTrChannelsWarning}`,
  });
};

export default createCommand({
  data,
  execute,
});
