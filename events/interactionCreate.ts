// eslint-disable-next-line spaced-comment, @typescript-eslint/triple-slash-reference
/// <reference path="../types/discord.js.d.ts" />
import { CacheType, Interaction, InteractionReplyOptions } from 'discord.js';
import { Events } from 'discord.js';

const name = Events.InteractionCreate;

async function execute(interaction: Interaction<CacheType>) {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);

		const options: InteractionReplyOptions = {
			content: 'There was an error while executing this command!',
			ephemeral: true,
		};

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp(options);
		}
		else {
			await interaction.reply(options);
		}
	}
}

export {
	name,
	execute,
};
