import { CommandExecutor, InGuild } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';

const inGuildExecutor: CommandExecutor<
  InGuild<ChatInputCommandInteraction>
> = async (interaction: ChatInputCommandInteraction, next) => {
  if (!interaction.inGuild()) {
    await interaction.reply('This command is only available on servers.');
    return;
  }

  await next();
};

export default inGuildExecutor;
