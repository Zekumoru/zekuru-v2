import { MessageReaction, PartialMessageReaction } from 'discord.js';
import cache from '../../cache';
import { errorDebug } from '../../utils/logger';
import MessageLink, { IMessageLink } from '../../db/models/MessageLink';
import getMessagesFromMessageLink from '../../commands/utilities/getMessagesFromMessageLink';

const getMessagesLink = async (
  reaction: MessageReaction | PartialMessageReaction
) => {
  // ignore if it is the bot
  if (reaction.me) return [];
  // ignore channels that aren't set with any language
  if (!(await cache.channelLink.get(reaction.message.channelId))) return [];

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      errorDebug('Something went wrong when fetching the message: ', error);
      return [];
    }
  }

  const message = reaction.message;
  if (!message.guild) return [];

  // Get message link from db
  const messageLink = await MessageLink.findOne<IMessageLink>({
    links: { $elemMatch: { messageId: message.id } },
  });
  if (!messageLink) return [];

  return [
    await getMessagesFromMessageLink(messageLink, message.id, message.guild),
    messageLink,
  ] as const;
};

export default getMessagesLink;
