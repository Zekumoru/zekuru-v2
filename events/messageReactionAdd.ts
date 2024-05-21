import {
  Events,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import { errorDebug } from '../utils/logger';
import MessageLink, { IMessageLink } from '../db/models/MessageLink';
import getMessagesFromMessageLink from '../commands/utilities/getMessagesFromMessageLink';
import cache from '../cache';

export const getMessagesLink = async (
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

export default {
  name: Events.MessageReactionAdd,
  execute: async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ) => {
    const [messages] = await getMessagesLink(reaction);
    if (!messages) return;

    // react with emoji
    await Promise.all(
      messages.map(async (message) => {
        try {
          // try to react with the emoji
          await message?.react(reaction.emoji);
        } catch (error) {
          // the emoji isn't available for the bot
          const { id, name } = reaction.emoji;
          // NOTE: Since this is pretty annoying, just ignore emojis of other servers
          // await message.reply({
          //   content: `<@${user.id}> has reacted with <:${name}:${id}>`,
          // });
        }
      })
    );
  },
} as DiscordEvent;
