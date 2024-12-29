import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const createConfirmationComponent = (
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
) => {
  const confirm = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel(confirmLabel)
    .setStyle(ButtonStyle.Danger);

  const cancel = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel(cancelLabel)
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    cancel,
    confirm
  );

  return row;
};

export default createConfirmationComponent;
