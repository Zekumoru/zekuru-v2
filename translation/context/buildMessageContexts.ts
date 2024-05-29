import { Message } from 'discord.js';

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

  return {
    message,
    replies: [await handleReplyChainHelper(replyMessage, depth, count + 1)],
  };
};

const handleReplyChain = async (message: Message, depth: number) => {
  return await handleReplyChainHelper(message, depth, 1);
};

const buildMessageContexts = async (
  message: Message,
  limit = 10,
  beforeMessageId?: string
) => {
  if (message.content === '') return;

  const messages = await message.channel.messages.fetch({
    limit,
    before: beforeMessageId ?? message.id,
  });

  const msgContexts: IMessageContext[] = [];
  for (const [_id, message] of messages) {
    msgContexts.push(await handleReplyChain(message, 3));
  }

  return msgContexts;
};

export default buildMessageContexts;
