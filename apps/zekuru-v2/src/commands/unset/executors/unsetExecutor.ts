/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InGuild, InteractionExecutor, InTextChannel } from '@zekuru-v2/types';
import ChannelCache from '../../../cache/ChannelCache';
import { ChatInputCommandInteraction } from 'discord.js';
import getLanguageName from '../../utilities/getLanguageName';
import LanguageCache from '../../../cache/LanguageCache';

const unsetExecutor: InteractionExecutor<
  {},
  InTextChannel<InGuild<ChatInputCommandInteraction>>
> = async ({ interaction }) => {
  const channelId =
    interaction.options.getChannel('channel')?.id ?? interaction.channelId;

  const channel = await ChannelCache.get(channelId);
  if (!channel) {
    await interaction.editReply(
      `<#${channelId}> has not been set to any language.`
    );
    return;
  }

  const language = await LanguageCache.get(channel.language.code, true);
  const languageName = getLanguageName(language, channel.language);

  await ChannelCache.delete(channelId, true);
  await interaction.editReply({
    content: `<#${channelId}>'s language \`${languageName}\` has been successfully unset.`,
  });
};

export default unsetExecutor;
