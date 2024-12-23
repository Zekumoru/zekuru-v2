/* eslint-disable @typescript-eslint/no-empty-object-type */

import { InGuild, InteractionExecutor } from '@zekuru-v2/types';
import {
  ChannelType,
  ChatInputCommandInteraction,
  TextChannel,
} from 'discord.js';

const inTextChannelExecutor: InteractionExecutor<
  {},
  InGuild<ChatInputCommandInteraction> & {
    channel: TextChannel;
  }
> = async (
  { interaction }: { interaction: ChatInputCommandInteraction },
  next
) => {
  if (interaction.channel?.type !== ChannelType.GuildText) {
    await interaction.reply('This command is only available on text channels.');
    return;
  }

  await next();
};

export default inTextChannelExecutor;
