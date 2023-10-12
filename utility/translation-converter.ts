import { Collection } from 'discord.js';

type TagsTable = Collection<number, string>;

const prepareForTranslation = (message: string) => {
	const tagsTable: TagsTable = new Collection();

	const leftBracket = {
		isFound: false,
		lastPosition: 0,
		position: 0,
	};

	const translateTextSubstrings: string[] = [];

	for (let i = 0; i < message.length; i++) {
		if (leftBracket.isFound && message[i] === '>') {
			tagsTable.set(leftBracket.position, message.substring(
				leftBracket.position,
				Number(i) + 1,
			));
			translateTextSubstrings.push(
				message.substring(leftBracket.lastPosition, leftBracket.position),
			);
			translateTextSubstrings.push(`<${leftBracket.position}>`);
			leftBracket.lastPosition = leftBracket.position = Number(i) + 1;
			leftBracket.isFound = false;
		}

		if (message[i] === '<') {
			leftBracket.isFound = true;
			leftBracket.position = i;
		}
	}
	translateTextSubstrings.push(message.substring(leftBracket.lastPosition));

	return {
		tagsTable,
		originalText: message,
		processedText: translateTextSubstrings.join(''),
	};
};

const returnTagsToTranslation = (
	translatedMessage: string,
	tagsTable: TagsTable,
) => {
	for (const [key] of tagsTable) {
		translatedMessage = translatedMessage.replace(`<${key}>`, tagsTable.get(key)!);
	}
	return translatedMessage;
};

export {
	prepareForTranslation,
	returnTagsToTranslation as returnTagsToTranslation,
};
