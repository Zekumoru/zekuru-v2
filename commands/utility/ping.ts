import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Checks bot\'s status');

async function execute(interaction: ChatInputCommandInteraction) {
	await interaction.reply('I\'m up and running!');
}

export {
	data,
	execute,
};
