/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InGuild, InteractionExecutor, InTextChannel } from '@zekuru-v2/types';
import { ChannelType, ChatInputCommandInteraction } from 'discord.js';

const inTextChannelExecutor: InteractionExecutor<
  {},
  InTextChannel<InGuild<ChatInputCommandInteraction>>
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
