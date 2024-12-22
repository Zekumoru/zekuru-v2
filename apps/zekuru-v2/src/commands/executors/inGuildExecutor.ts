/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandExecutor, InGuild } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const inGuildExecutor: CommandExecutor<
  any,
  InGuild<ChatInputCommandInteraction>
> = async (interaction: ChatInputCommandInteraction, _context, next) => {
  if (!interaction.inGuild()) {
    await interaction.reply('This command is only available on servers.');
    return;
  }

  await next();
};

export default inGuildExecutor;
