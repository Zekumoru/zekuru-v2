import { Message } from 'discord.js';
import buildMessageContexts, {
  IMessageContext,
} from './buildChatHistoryMessages';

const buildChatMessageContent = (message: Message, indent: string) => {
  const strBuilder: string[] = [];

  // message content exists
  if (message.content !== '') {
    const tokens = message.content.split(/(\r\n|\n|\r)/g);
    tokens.filter((t) => !/(\r\n|\n|\r)/g.test(t));
    tokens.forEach((token) => {
      if (token.trim() === '') return;
      strBuilder.push(indent + token);
    });
  }
  // check if sticker
  if (message.stickers.size) {
    strBuilder.push(indent + '"""sticker"""');
  }
  // check if attachment
  if (message.attachments.size) {
    strBuilder.push(indent + '"""attachment"""');
  }
  // check if embed
  if (message.embeds.length) {
    strBuilder.push(indent + '"""embed"""');
  }

  return strBuilder.join('\n');
};

const buildChatMessagesContextStrings = (
  outStrings: string[],
  msgContexts: IMessageContext[],
  count = 0
) => {
  const indent = '  '.repeat(count);
  let prevUsername = '';

  for (let i = msgContexts.length - 1; i >= 0; i--) {
    const { message, replies } = msgContexts[i];
    const username = message.member?.displayName ?? message.author.username;

    if (replies.length) {
      if (prevUsername !== '') {
        // close context message
        outStrings.push(indent + '"""');
        if (count === 0) outStrings.push('');
        prevUsername = '';
      }

      buildChatMessagesContextStrings(outStrings, replies, count + 1);
    }

    if (prevUsername !== username) {
      if (prevUsername !== '') {
        // close context message
        outStrings.push(indent + '"""');
        if (count === 0) outStrings.push('');
        prevUsername = '';
      }

      outStrings.push(indent + username);
      outStrings.push(indent + '"""');
      prevUsername = username;
    }

    outStrings.push(buildChatMessageContent(message, indent));
  }

  // close context message
  outStrings.push(indent + '"""');
  if (count === 0) outStrings.push('');
};

const buildChatHistoryContext = async (
  message: Message,
  limit = 10,
  beforeMessageId?: string,
  replyLimit = 3
) => {
  const outStrings: string[] = [];
  const msdContexts = await buildMessageContexts(
    message,
    limit,
    beforeMessageId,
    replyLimit
  );
  if (msdContexts) {
    buildChatMessagesContextStrings(outStrings, msdContexts);
  }
  return outStrings.join('\n');
};

export default buildChatHistoryContext;