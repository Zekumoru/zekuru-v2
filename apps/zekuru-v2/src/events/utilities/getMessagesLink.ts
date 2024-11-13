import { Message, MessageReaction, PartialMessageReaction } from 'discord.js';
import getMessagesFromMessageLink from '../../commands/utilities/getMessagesFromMessageLink';
import { channelLink as channelLinkCache } from '@zekuru-v2/cache';
import { logger } from '@zekuru-v2/utils';
import { MessageLink } from '@zekuru-v2/db';
import { IMessageLink } from '@zekuru-v2/types';

const getMessagesLink = async (
  reaction: MessageReaction | PartialMessageReaction
): Promise<[Message<true>[] | undefined, IMessageLink | undefined]> => {
  // ignore if it is the bot
  if (reaction.me) return [undefined, undefined];
  // ignore channels that aren't set with any language
  if (!(await channelLinkCache.get(reaction.message.channelId)))
    return [undefined, undefined];

  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      logger.error('Something went wrong when fetching the message: ', error);
      return [undefined, undefined];
    }
  }

  const message = reaction.message;
  if (!message.guild) return [undefined, undefined];

  // Get message link from db
  const messageLink = await MessageLink.findOne<IMessageLink>({
    links: { $elemMatch: { messageId: message.id } },
  });
  if (!messageLink) return [undefined, undefined];

  return [
    await getMessagesFromMessageLink(messageLink, message.id, message.guild),
    messageLink,
  ] as const;
};

export default getMessagesLink;
