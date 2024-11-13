import { ChannelType, Events, Message, PartialMessage } from 'discord.js';
import updateTranslateMessages from './utilities/updateTranslateMessages';

export default {
  name: Events.MessageUpdate,
  execute: async (
    _oldMessage: Message<boolean> | PartialMessage,
    newMessage: Message<boolean> | PartialMessage
  ) => {
    if (newMessage.author?.bot) return;
    if (newMessage.channel.type !== ChannelType.GuildText) return;
    // only handle message content updates
    if (!newMessage.content) return;

    await updateTranslateMessages(newMessage);
  },
};
