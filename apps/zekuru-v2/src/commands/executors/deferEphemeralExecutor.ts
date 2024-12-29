/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InteractionExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const deferEphemeralExecutor: InteractionExecutor<
  {},
  ChatInputCommandInteraction
> = async ({ interaction }, next) => {
  await interaction.deferReply({ ephemeral: true });

  await next();
};

export default deferEphemeralExecutor;
