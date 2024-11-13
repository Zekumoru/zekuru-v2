import { Events, MessageReaction, PartialMessageReaction } from 'discord.js';
import getMessagesLink from './utilities/getMessagesLink';
import { DiscordEvent } from '@zekuru-v2/types';

export default {
  name: Events.MessageReactionAdd,
  execute: async (reaction: MessageReaction | PartialMessageReaction) => {
    const [messages] = await getMessagesLink(reaction);
    if (!messages) return;

    // react with emoji
    await Promise.all(
      messages.map(async (message) => {
        try {
          // try to react with the emoji
          await message?.react(reaction.emoji);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // the emoji isn't available for the bot

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
