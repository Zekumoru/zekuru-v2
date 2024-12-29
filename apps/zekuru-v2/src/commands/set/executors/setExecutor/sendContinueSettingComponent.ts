import { ChatInputCommandInteraction } from 'discord.js';
import setResponses from './setResponses';
import createConfirmationComponent from './createConfirmationComponent';
import { asyncExec } from '@zekuru-v2/utils';

const sendContinueSettingComponent = async (
  interaction: ChatInputCommandInteraction,
  channelId: string,
  api: string,
  languageName: string
): Promise<boolean> => {
  const userId = interaction.user.id;

  const confirmationInteraction = await interaction.editReply({
    content: setResponses.askUnsupported(api, languageName),
    components: [createConfirmationComponent('Yes, continue')],
  });

  const [confirmation] = await asyncExec(
    confirmationInteraction.awaitMessageComponent({
      filter: (interaction) => interaction.user.id === userId,
      time: 30_000,
    })
  );

  if (!confirmation) {
    await interaction.editReply({
      content: setResponses.timedOutUnsupported(channelId),
      components: [],
    });
    return false;
  }

  if (confirmation.customId !== 'confirm') {
    await interaction.editReply({
      content: setResponses.cancelUnsupported(channelId),
      components: [],
    });
    return false;
  }

  return true;
};

export default sendContinueSettingComponent;
