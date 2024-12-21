import { ChatInputCommandInteraction } from 'discord.js';

const createNoopHandler = (message: string) => {
  return async (interaction: ChatInputCommandInteraction) => {
    interaction.editReply({ content: message });
  };
};

export default createNoopHandler;
