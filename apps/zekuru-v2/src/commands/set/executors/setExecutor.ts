/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InGuild, InteractionExecutor, InTextChannel } from '@zekuru-v2/types';
import LanguageCache from '../../../cache/LanguageCache';
import ChannelCache from '../../../cache/ChannelCache';
import GuildCache from '../../../cache/GuildCache';
import { ChatInputCommandInteraction } from 'discord.js';
import parseLanguageInput from './setExecutor/parseLanguageInput';
import setResponses from './setExecutor/setResponses';
import getLanguageName from './setExecutor/getLanguageName';
import setNewChannel from './setExecutor/setNewChannel';
import alreadySetToSameLanguage from './setExecutor/alreadySetToSameLanguage';
import sendContinueSettingComponent from './setExecutor/sendContinueSettingComponent';
import sendChangeLanguageComponent from './setExecutor/sendChangeLanguageComponent';

const setExecutor: InteractionExecutor<
  {},
  InTextChannel<InGuild<ChatInputCommandInteraction>>
> = async ({ interaction }) => {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  const channelId =
    interaction.options.getChannel('channel')?.id ?? interaction.channelId;

  const languageInput = interaction.options.getString('language', true);
  const channelLanguage = parseLanguageInput(languageInput);

  const language = await LanguageCache.get(channelLanguage.code);
  if (!language) {
    await interaction.editReply(setResponses.invalid(languageInput));
    return;
  }

  const guild = await GuildCache.get(guildId, true);
  const api = guild.translation.credentials[0];
  const languageName = getLanguageName(language, channelLanguage);

  if (!language.supports.includes(api.type)) {
    const continueSetting = await sendContinueSettingComponent(
      interaction,
      channelId,
      api.type,
      languageName
    );

    if (!continueSetting) return;
  }

  const channel = await ChannelCache.get(channelId);
  if (!channel) {
    await setNewChannel(userId, guildId, channelId, channelLanguage);
    await interaction.editReply(setResponses.newSet(channelId, languageName));
    return;
  }

  if (alreadySetToSameLanguage(channel, channelLanguage)) {
    await interaction.editReply(
      setResponses.alreadySet(channelId, languageName)
    );
    return;
  }

  const changeConfirmed = await sendChangeLanguageComponent(
    interaction,
    channel,
    languageName
  );

  if (!changeConfirmed) return;

  channel.language = channelLanguage;
  channel.modifiedAt = new Date();
  await ChannelCache.set(channelId, channel);
  await interaction.editReply({
    content: setResponses.confirmChange(channelId, languageName),
    components: [],
  });
};

export default setExecutor;
