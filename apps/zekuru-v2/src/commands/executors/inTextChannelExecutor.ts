/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandExecutor, InGuild } from '@zekuru-v2/types';
import {
  ChannelType,
  ChatInputCommandInteraction,
  TextChannel,
} from 'discord.js';

const inTextChannelExecutor: CommandExecutor<
  any,
  InGuild<ChatInputCommandInteraction> & {
    channel: TextChannel;
  }
> = async (interaction: ChatInputCommandInteraction, _context, next) => {
  if (interaction.channel?.type !== ChannelType.GuildText) {
    await interaction.reply('This command is only available on text channels.');
    return;
  }

  await next();
};

export default inTextChannelExecutor;
