import { InGuild, InTextChannel } from '@zekuru-v2/types';
import { channelMention, ChatInputCommandInteraction } from 'discord.js';
import LinkOptions from '../LinkOptions';
import validateChannels from '../validateChannels';
import { formatValidationResults, LinkManager } from '@zekuru-v2/core';
import ChannelCache from '../../../cache/ChannelCache';

const CHANNEL_ID_REGEX = /<#\d*>/g;

const linkMultipleHandler = async (
  interaction: InTextChannel<InGuild<ChatInputCommandInteraction>>,
) => {
  const channelsRaw = interaction.options.getString(
    LinkOptions.Multiple.CHANNELS,
  );
  const channelTags = channelsRaw?.match(CHANNEL_ID_REGEX);

  // Validations
  if (!channelsRaw || !channelTags) {
    interaction.reply({
      content: `Cannot link, you didn't provide any channels!`,
    });
    return;
  }

  const channels = (
    await Promise.all(
      channelTags.map((tag) => {
        const channelId = tag.slice(2, tag.length - 1);
        return interaction.client.channels.fetch(channelId);
      }),
    )
  ).filter((d) => d != null);

  const validationResults = await validateChannels(channels);
  const channelsString = formatValidationResults(
    channels.map((c) => channelMention(c.id)),
  );

  if (validationResults.length) {
    const reasons = validationResults.map((r) => `- ${r}`).join('\n');
    const s = validationResults.length !== 1 ? 's' : '';
    await interaction.editReply(
      `Cannot link ${channelsString} for the following reason${s}:\n${reasons}`,
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
    `${channelsString} have been linked **${mode}ly**.`,
  );
};

export default linkMultipleHandler;
