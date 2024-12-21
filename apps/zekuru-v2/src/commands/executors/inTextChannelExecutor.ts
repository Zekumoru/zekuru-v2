import { CommandExecutor, InGuild } from '@zekuru-v2/types';
import {
  ChannelType,
  ChatInputCommandInteraction,
  TextChannel,
} from 'discord.js';

const inTextChannelExecutor: CommandExecutor<
  InGuild<ChatInputCommandInteraction> & {
    channel: TextChannel;
  }
> = async (interaction: ChatInputCommandInteraction, next) => {
  if (interaction.channel?.type !== ChannelType.GuildText) {
    await interaction.reply('This command is only available on text channels.');
    return;
  }

  await next();
};

export default inTextChannelExecutor;
