/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InGuild, InteractionExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const inGuildExecutor: InteractionExecutor<
  {},
  InGuild<ChatInputCommandInteraction>
> = async (
  { interaction }: { interaction: ChatInputCommandInteraction },
  next
) => {
  if (!interaction.inGuild()) {
    await interaction.reply('This command is only available on servers.');
    return;
  }

  await next();
};

export default inGuildExecutor;
