/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InteractionExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const deferExecutor: InteractionExecutor<
  {},
  ChatInputCommandInteraction
> = async ({ interaction }, next) => {
  await interaction.deferReply();

  await next();
};

export default deferExecutor;
