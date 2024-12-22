/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandExecutor, InGuild } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const inChannelExecutor: CommandExecutor<
  any,
  InGuild<ChatInputCommandInteraction> & {
    channel: Exclude<InGuild<ChatInputCommandInteraction>['channel'], null>;
  }
> = async (interaction: ChatInputCommandInteraction, _context, next) => {
  if (!interaction.channel) {
    await interaction.reply('This command is only available on channels.');
    return;
  }

  await next();
};

export default inChannelExecutor;
