import { ChatInputCommandInteraction } from 'discord.js';

const createNoopHandler = (message: string) => {
  return async (interaction: ChatInputCommandInteraction) => {
    interaction.reply({
      content: message,
      ephemeral: true,
    });
  };
};

export default createNoopHandler;
