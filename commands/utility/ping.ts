import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription(`Checks bot's status`);

export async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply(`I'm up and running!`);
}