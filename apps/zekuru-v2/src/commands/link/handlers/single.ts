import { InGuild, InTextChannel } from '@zekuru-v2/types';
import {
  Channel,
  channelMention,
  ChatInputCommandInteraction,
} from 'discord.js';
import LinkOptions, { SingleModeOption } from '../LinkOptions';
import validateChannels from '../validateChannels';
import {
  LinkManager,
  LinkOptions as LinkManagerOptions,
} from '@zekuru-v2/core';
import ChannelCache from '../../../cache/ChannelCache';

const linkSingleHandler = async (
  interaction: InTextChannel<InGuild<ChatInputCommandInteraction>>,
) => {
  const sourceChannel =
    interaction.options.getChannel(LinkOptions.Single.SOURCE_CHANNEL) ??
    interaction.channel;
  const targetChannel = interaction.options.getChannel(
    LinkOptions.Single.TARGET_CHANNEL,
    true,
  );

  // Validations
  const validationResults = await validateChannels([
    sourceChannel as Channel,
    targetChannel as Channel,
  ]);

  if (validationResults.length) {
    const reasons = validationResults.map((r) => `- ${r}`).join('\n');
    const s = validationResults.length !== 1 ? 's' : '';
    await interaction.editReply(
      `Cannot link ${channelMention(sourceChannel.id)} to ${channelMention(targetChannel.id)} for the following reason${s}:\n${reasons}`,
    );
    return;
  }

  const sourceTrChannel = await ChannelCache.get(sourceChannel.id, true);
  const targetTrChannel = await ChannelCache.get(targetChannel.id, true);

  if (sourceTrChannel.links.includes(targetTrChannel._id)) {
    await interaction.editReply(
      `${channelMention(sourceChannel.id)} is **already linked** to ${channelMention(targetChannel.id)}!`,
    );
    return;
  }

  // Linking
  const modeOption = (interaction.options.getString(LinkOptions.Single.MODE) ??
    'bi-recursive') as SingleModeOption;

  const linkManager = new LinkManager(ChannelCache);
  const trChannels = [sourceTrChannel, targetTrChannel];
  await linkManager.link(trChannels, buildLinkOptions(modeOption));

  await ChannelCache.setMany(trChannels);

  // Output
  await interaction.editReply(
    `${channelMention(sourceChannel.id)} has been linked **${modeOption}ly** to ${channelMention(targetChannel.id)}.`,
  );
};

function buildLinkOptions(modeOption: SingleModeOption): LinkManagerOptions {
  let mono: boolean;
  let mode: LinkManagerOptions['mode'];
  switch (modeOption) {
    case 'unidirectional':
    case 'bidirectional':
      mono = modeOption === 'unidirectional';
      mode = 'non-recursive';
      break;
    case 'mono-adjacent':
    case 'bi-adjacent':
      mono = modeOption === 'mono-adjacent';
      mode = 'adjacent';
      break;
    case 'mono-recursive':
    case 'bi-recursive':
      mono = modeOption === 'mono-recursive';
      mode = 'recursive';
      break;
  }

  return { single: true, mono, mode };
}

export default linkSingleHandler;
