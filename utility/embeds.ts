import { EmbedBuilder, Message } from 'discord.js';

const createTranslatedMessageEmbed = async (
	message: Message<true>,
	translatedText: string,
	sourceChannelName: string,
) => {
	const member = await message.guild.members.fetch(message.author.id);

	return new EmbedBuilder()
		.setAuthor({
			name: member.displayName || message.author.username,
			iconURL: member.avatarURL() || message.author.avatarURL() || '',
		})
		.setDescription(translatedText)
		.setColor('Blue')
		.setFooter({
			text: `Translated from #${sourceChannelName} using Deepl.`,
		});
};

export {
	createTranslatedMessageEmbed,
};
