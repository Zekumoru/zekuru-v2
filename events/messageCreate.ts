// eslint-disable-next-line spaced-comment, @typescript-eslint/triple-slash-reference
/// <reference path="../types/environment.d.ts" />
import { Events, Message } from 'discord.js';
import * as deepl from 'deepl-node';
import { prepareForTranslation, returnTagsToTranslation } from '../utility/translation-converter';
import { createTranslatedMessageEmbed } from '../utility/embeds';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

const name = Events.MessageCreate;

async function execute(message: Message<true>) {
	if (message.author.bot) return;

	const processedMessage = prepareForTranslation(message.content);

	const result = await translator.translateText(processedMessage.processedText, null, 'en-US');
	const translated = returnTagsToTranslation(result.text, processedMessage.tagsTable);

	const translatedMessageEmbed = await createTranslatedMessageEmbed(
		message,
		translated,
		message.channel.name,
	);

	message.channel.send({
		embeds: [ translatedMessageEmbed ],
	});
}

export {
	name,
	execute,
};
