import { Message } from 'discord.js';
import getOriginalMessage from './getOriginalMessage';

export interface IMessageContext {
  message: Message;
  replies: IMessageContext[];
}

const handleReplyChainHelper = async (
  message: Message,
  depth: number,
  count: number
): Promise<IMessageContext> => {
  const contextMessage = {
    message,
    replies: [],
  };
  if (count > depth) return contextMessage;
  if (!message.reference?.messageId) return contextMessage;

  const replyMessage = await message.channel.messages.fetch(
    message.reference.messageId
  );

  if (!replyMessage) return contextMessage;
  // check reference id and the fetched message, this tells us if
  // the message isn't deleted (by the user)
  if (message.reference.messageId !== replyMessage.id) return contextMessage;

  const originalReplyMessage = await getOriginalMessage(replyMessage);

  return {
    message,
    replies: [
      await handleReplyChainHelper(
        originalReplyMessage ?? replyMessage,
        depth,
        count + 1
      ),
    ],
  };
};

export const handleChatHistoryReplyChain = async (
  message: Message,
  depth: number
) => {
  return await handleReplyChainHelper(message, depth, 1);
};

const buildMessageContexts = async (
  message: Message,
  limit = 10,
  beforeMessageId?: string,
  replyLimit = 3
) => {
  if (message.content === '') return;

  const messages = await message.channel.messages.fetch({
    limit,
    before: beforeMessageId ?? message.id,
  });

  return await Promise.all(
    messages.map(async (message) => {
      const originalMessage = await getOriginalMessage(message);
      return await handleChatHistoryReplyChain(
        originalMessage ?? message,
        replyLimit
      );
    })
  );
};

export default buildMessageContexts;
