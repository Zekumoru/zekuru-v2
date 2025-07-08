import { InGuild, InTextChannel } from '@zekuru-v2/types';
import {
  CategoryChannel,
  channelMention,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import LinkOptions from '../LinkOptions';
import validateChannels from '../validateChannels';
import ChannelCache from '../../../cache/ChannelCache';
import { LinkManager } from '@zekuru-v2/core';

// const CHANNEL_ID_REGEX = /<#\d*>/g;

const linkCategoryHandler = async (
  interaction: InTextChannel<InGuild<ChatInputCommandInteraction>>,
) => {
  const unknownChannel =
    interaction.options.getChannel(LinkOptions.Group.CATEGORY_CHANNEL) ??
    interaction.channel.parent;

  // Category validations
  if (!unknownChannel) {
    interaction.editReply(
      `Cannot link, you didn't provide a category channel!`,
    );
    return;
  }

  if (unknownChannel.type !== ChannelType.GuildCategory) {
    interaction.editReply(
      `Cannot link, ${channelMention(unknownChannel.id)} **is not** a category channel!`,
    );
    return;
  }

  const category = unknownChannel as CategoryChannel;

  const channels = Array.from(
    category.children.cache
      .filter((channel) => channel.type === ChannelType.GuildText)
      .values(),
  );

  // Channels validations
  const validationResults = await validateChannels(channels);
  if (validationResults.length) {
    const reasons = validationResults.map((r) => `- ${r}`).join('\n');
    const s = validationResults.length !== 1 ? 's' : '';
    await interaction.editReply(
      `Cannot link ${channelMention(category.id)} for the following reason${s}:\n${reasons}`,
    );
    return;
  }

  // Linking
  const trChannels = await Promise.all(
    channels.map((c) => ChannelCache.get(c.id, true)),
  );
  const recursive =
    interaction.options.getBoolean(LinkOptions.Multiple.RECURSIVE) ?? true;

  const linkManager = new LinkManager(ChannelCache);
  const mode = recursive ? 'recursive' : 'non-recursive';
  await linkManager.link(trChannels, { mode });

  await ChannelCache.setMany(linkManager.getLinkedChannels());

  // Output
  await interaction.editReply(
    `The channels in ${channelMention(category.id)} have been linked **${mode}ly**.`,
  );
};

export default linkCategoryHandler;
