import { Channel } from '@zekuru-v2/entities';
import LanguageCache from '../../../../cache/LanguageCache';
import { ChatInputCommandInteraction } from 'discord.js';
import getLanguageName from './getLanguageName';
import setResponses from './setResponses';
import createConfirmationComponent from './createConfirmationComponent';
import { asyncExec } from '@zekuru-v2/utils';

const sendChangeLanguageComponent = async (
  interaction: ChatInputCommandInteraction,
  channel: Channel,
  languageName: string
): Promise<boolean> => {
  const userId = interaction.user.id;
  const channelId = channel._id;

  const oldLanguage = await LanguageCache.get(channel.language.code, true);
  const oldLanguageName = getLanguageName(oldLanguage, channel.language);
  const confirmationInteraction = await interaction.editReply({
    content: setResponses.askReset(channelId, languageName, oldLanguageName),
    components: [createConfirmationComponent('Yes, change')],
  });
  const [confirmation] = await asyncExec(
    confirmationInteraction.awaitMessageComponent({
      filter: (interaction) => interaction.user.id === userId,
      time: 30_000,
    })
  );

  if (!confirmation) {
    await interaction.editReply({
      content: setResponses.timedOutChange(channelId, oldLanguageName),
      components: [],
    });
    return false;
  }

  if (confirmation.customId !== 'confirm') {
    await interaction.editReply({
      content: setResponses.cancelChange(channelId, oldLanguageName),
      components: [],
    });
    return false;
  }

  return true;
};

export default sendChangeLanguageComponent;
