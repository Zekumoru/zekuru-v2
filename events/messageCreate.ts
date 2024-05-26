import { ChannelType, Events, Message } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import cache from '../cache';
import buildLongContentEmbeds from '../commands/utilities/buildLongContentEmbeds';

const outputMessage = (message: Message, indent?: number) => {
  const username = message.author.username;
  let output = indent && indent > 0 ? '  '.repeat(indent) : '';

  // message content exists
  if (message.content !== '') {
    output += `[[message:${username}]]: ${message.content}`;
  }
  // check if sticker
  else if (message.stickers.size) {
    output += `[[sticker:${username}]]`;
  }
  // check if attachment
  else if (message.attachments.size) {
    output += `[[attachment:${username}]]`;
  }
  // check if embed
  else if (message.embeds.length) {
    output += `[[embed:${username}]]`;
  }
  // check if embed
  else {
    output += `[[generic:${username}]]`;
  }

  console.log(output);
};

const handleReplyChainHelper = async (
  message: Message,
  depth: number,
  count: number
) => {
  if (count > depth) return;
  if (!message.reference?.messageId) return;

  const replyMessage = await message.channel.messages.fetch(
    message.reference.messageId
  );

  // check reference id and the fetched message, this tells us if
  // the message isn't deleted (by the user)
  if (replyMessage && message.reference.messageId === replyMessage.id) {
    outputMessage(replyMessage, count);
    await handleReplyChainHelper(replyMessage, depth, count + 1);
  }
};

const handleReplyChain = async (message: Message, depth: number) => {
  await handleReplyChainHelper(message, depth, 1);
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
    for (const [_id, message] of messages) {
      outputMessage(message);
      await handleReplyChain(message, 3);
    }

    const webhook = await cache.webhook.get(channel);
    webhook.send({
      username: message.member?.displayName ?? message.author.displayName,
      avatarURL:
        message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined,
      embeds: buildLongContentEmbeds(message.content),
    });
  },
} as DiscordEvent;
