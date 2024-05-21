import { ChannelType, Events, Message, PartialMessage } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import MessageLink from '../models/MessageLink';
import getMessagesFromMessageLink from '../commands/utilities/getMessagesFromMessageLink';
import { errorDebug } from '../utils/logger';

export default {
  name: Events.MessageDelete,
  execute: async (message: Message<boolean> | PartialMessage) => {
    if (!message.guild) return;
    if (message.channel.type !== ChannelType.GuildText) return;

    // get message link
    const link = await MessageLink.findOne({
      links: { $elemMatch: { messageId: message.id } },
    }); // using $elemMatch because an admin can delete a message
    if (!link) return;

    // get other channels' linked messages
    const messages = await getMessagesFromMessageLink(
      link,
      message.id,
      message.guild
    );
    if (!messages) return;

    // delete messages and the message link from db
    await Promise.all(
      messages.map(async (message) => {
        if (!message) return;
        if (message.channel.type !== ChannelType.GuildText) return;

        try {
          await message.delete();
        } catch (error) {
          errorDebug(error);
        }
      })
    );
    await MessageLink.deleteOne({ messageId: link.messageId });
  },
} as DiscordEvent;
