import { Message } from 'discord.js';
import getOriginalMessage from './getOriginalMessage';
import buildChatHistoryContext from './buildChatHistoryContext';
import listToString from '../../utilities/listToString';
import { Language } from '../languages';

const buildTranslationContextContent = async (
  message: Message,
  targetLanguages: Language[]
) => {
  if (message.content === '') return;

  const username = message.member?.displayName ?? message.author.displayName;

  // Specify who sent the message
  const strBuilder: string[] = [];
  strBuilder.push(`User: ${username}`);
  strBuilder.push(``);

  // Check if this message is replying
  if (message.reference?.messageId) {
    const replyMessage = await message.channel.messages.fetch(
      message.reference.messageId
    );
    const originalReplyMessage = await getOriginalMessage(replyMessage);
    const toProcessMessage = originalReplyMessage ?? replyMessage;
    const replyHistoryText = await buildChatHistoryContext(
      toProcessMessage,
      1,
      undefined,
      0
    );

    strBuilder.push(`Replying to:`);
    strBuilder.push(replyHistoryText);
    strBuilder.push(``);
  }

  // check if has history
  const chatHistoryText = await buildChatHistoryContext(message);
  if (chatHistoryText !== '') {
    strBuilder.push(`Chat history (indented means replying to):`);
    strBuilder.push(chatHistoryText);
    strBuilder.push(``);
  }

  strBuilder.push(
    `Translate the next message TAKING YOUR TIME UNDERSTANDING CAREFULLY what it means TAKING NOTE of the context/reply above to translate EFFICIENTLY and MEANINGFULLY, and not modifying the original message to JSON format in ${listToString(
      targetLanguages.map((lang) => lang.name)
    )}:`
  );
  strBuilder.push(`"""`);
  strBuilder.push(message.content);
  strBuilder.push(`"""`);

  return strBuilder.join('\n');
};

export default buildTranslationContextContent;
