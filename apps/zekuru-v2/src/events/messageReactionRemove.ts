import {
  Events,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import getMessagesLink from './utilities/getMessagesLink';
import { DiscordEvent, IMessageLink } from '@zekuru-v2/types';

export default {
  name: Events.MessageReactionRemove,
  execute: async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ) => {
    const [messages, messageLink] = (await getMessagesLink(reaction)) as [
      Message<true>[],
      IMessageLink
    ];
    if (!messages) return;
    // only original reactor can remove
    if (user.id !== messageLink.authorId) return;

    await Promise.all(
      messages.map(async (message) => {
        const reactionMessage = message?.reactions.resolve(
          reaction.emoji.id ?? reaction.emoji.name ?? ''
        );
        if (!reactionMessage) return;

        reactionMessage.users.remove(reaction.client.user.id);
      })
    );
  },
} as DiscordEvent;
