/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InteractionErrorExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';
import { logger } from '@zekuru-v2/utils';

const catchAllExecutor: InteractionErrorExecutor<
  Error,
  {},
  ChatInputCommandInteraction
> = async (error, { interaction }) => {
  if (interaction.deferred) {
    await interaction.editReply(`${error.name}: ${error.message}`);
  } else {
    await interaction.reply(`${error.name}: ${error.message}`);
  }

  logger.error(error);
};

export default catchAllExecutor;
