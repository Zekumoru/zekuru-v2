import {
  Events,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import getMessagesLink from './utilities/getMessagesLink';

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
