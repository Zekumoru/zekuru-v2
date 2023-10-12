import { Events, Message } from 'discord.js';

const name = Events.MessageCreate;

async function execute(message: Message<true>) {
	if (message.author.bot) return;

	console.log(`Received: ${message.content}`);
}

export {
	name,
	execute,
};
