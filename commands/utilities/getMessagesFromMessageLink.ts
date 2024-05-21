import { ChannelType, Guild, Message } from 'discord.js';
import { IMessageLink } from '../../models/MessageLink';

const getMessagesFromMessageLink = async (
  messageLink: IMessageLink,
  ignoreMessageId: string,
  guild: Guild
) => {
  try {
    const messages = (await Promise.all(
      messageLink.links.map(async (link) => {
        // ignore the message that the user has reacted to
        if (link.messageId === ignoreMessageId) return;

        const channel = guild.channels.cache.get(link.channelId);
        if (!channel) return;
        if (channel.type !== ChannelType.GuildText) return;
        return await channel.messages.fetch(link.messageId);
      })
    )) as unknown as (Message<true> | undefined)[] | undefined;

    return messages;
  } catch (error) {
    return;
  }
};

export default getMessagesFromMessageLink;
