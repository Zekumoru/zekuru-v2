/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InteractionErrorExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';
import * as deepl from 'deepl-node';

const invalidDeeplKeyExecutor: InteractionErrorExecutor<
  Error,
  {},
  ChatInputCommandInteraction
> = async (error, { interaction }, next) => {
  if (error instanceof deepl.AuthorizationError) {
    await interaction.editReply(
      `Invalid Deepl API key! Make sure that it's valid and active.`
    );
    return;
  }

  await next();
};

export default invalidDeeplKeyExecutor;
