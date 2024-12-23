/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InGuild, InteractionExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const inChannelExecutor: InteractionExecutor<
  {},
  InGuild<ChatInputCommandInteraction> & {
    channel: Exclude<InGuild<ChatInputCommandInteraction>['channel'], null>;
  }
> = async (
  { interaction }: { interaction: ChatInputCommandInteraction },
  next
) => {
  if (!interaction.channel) {
    await interaction.reply('This command is only available on channels.');
    return;
  }

  await next();
};

export default inChannelExecutor;
