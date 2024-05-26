import { ChannelType, Events, Message } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import cache from '../cache';
import buildLongContentEmbeds from '../commands/utilities/buildLongContentEmbeds';

const buildContextContent = (message: Message, indent?: number) => {
  let indentString = '';
  if (indent && indent > 0) {
    indentString = '  '.repeat(indent);
  }

  const username = message.member?.displayName ?? message.author.username;
  const strBuilder: string[] = [];
  strBuilder.push(indentString + username);
  strBuilder.push(indentString + '"""');

  // message content exists
  if (message.content !== '') {
    const tokens = message.content.split(/(\r\n|\n|\r)/g);
    tokens.forEach((token) => strBuilder.push(indentString + token));
  }
  // check if sticker
  if (message.stickers.size) {
    strBuilder.push(indentString + '"""sticker"""');
  }
  // check if attachment
  if (message.attachments.size) {
    strBuilder.push(indentString + '"""attachment"""');
  }
  // check if embed
  if (message.embeds.length) {
    strBuilder.push(indentString + '"""embed"""');
  }

  strBuilder.push(indentString + '"""');
  return strBuilder.join('\n');
};

interface IMessageContext {
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

const buildMessageContextsStrings = (
  outStrings: string[],
  msgContexts: IMessageContext[],
  count = 0
) => {
  for (let i = msgContexts.length - 1; i >= 0; i--) {
    const { message, replies } = msgContexts[i];
    if (replies.length) {
      buildMessageContextsStrings(outStrings, replies, count + 1);
    }
    outStrings.push(buildContextContent(message, count));
    if (count === 0) outStrings.push('');
  }
};

export default {
  name: Events.MessageCreate,
  execute: async (message: Message) => {
    if (message.author.bot) return;
    if (message.channelId !== '983305448151191552') return; // Dev Server's test channel

    const channel = message.guild?.channels.cache.get(message.channelId);
    if (!channel) return;
    if (channel.type !== ChannelType.GuildText) return;

    if (message.content === '') return;

    const messages = await message.channel.messages.fetch({
      limit: 10,
      before: '1244219469983780946',
    });
    const msdContexts: IMessageContext[] = [];
    for (const [_id, message] of messages) {
      msdContexts.push(await handleReplyChain(message, 3));
    }

    const outStrings: string[] = [];
    buildMessageContextsStrings(outStrings, msdContexts);

    const webhook = await cache.webhook.get(channel);
    webhook.send({
      username: message.member?.displayName ?? message.author.displayName,
      avatarURL:
        message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined,
      embeds: buildLongContentEmbeds('```' + outStrings.join('\n') + '```'),
    });
  },
} as DiscordEvent;
