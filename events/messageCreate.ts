import { ChannelType, Events, Message } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import cache from '../cache';
import buildLongContentEmbeds from '../commands/utilities/buildLongContentEmbeds';
import { appDebug } from '../utilities/logger';

const buildContextContent = (message: Message, indent: string) => {
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

      buildMessageContextsStrings(outStrings, replies, count + 1);
    }

    if (prevUsername !== username) {
      outStrings.push(indent + username);
      outStrings.push(indent + '"""');
      prevUsername = username;
    }

    outStrings.push(buildContextContent(message, indent));
  }

  // close context message
  outStrings.push(indent + '"""');
  if (count === 0) outStrings.push('');
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

    appDebug('start');
    const messages = await message.channel.messages.fetch({
      limit: 10,
      before: message.id,
    });
    const msdContexts: IMessageContext[] = [];
    for (const [_id, message] of messages) {
      msdContexts.push(await handleReplyChain(message, 3));
    }

    const outStrings: string[] = [];
    buildMessageContextsStrings(outStrings, msdContexts);
    appDebug('end');

    const webhook = await cache.webhook.get(channel);
    webhook.send({
      username: message.member?.displayName ?? message.author.displayName,
      avatarURL:
        message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined,
      embeds: buildLongContentEmbeds('```' + outStrings.join('\n') + '```'),
    });
  },
} as DiscordEvent;
