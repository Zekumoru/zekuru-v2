import { ChannelType, Events, Message, PartialMessage } from 'discord.js';
import webhookCache from '../cache/webhookCache';
import MessageLink from '../models/MessageLink';
import getMessagesFromMessageLink from '../commands/utilities/getMessagesFromMessageLink';
import {
  DISCORD_MESSAGE_CHARS_LIMIT,
  translateContent,
} from './messageCreateTranslate';
import translateChannels from '../cache/translateChannels';
import { errorDebug } from '../utils/logger';

export const updateTranslateMessages = async (
  newMessage: Message<boolean> | PartialMessage
) => {
  if (!newMessage.guild) return;

  // get message link
  const link = await MessageLink.findOne({ messageId: newMessage.id });
  if (!link) return;

  // check if the edited message's translate channel exists
  const sourceTrChannel = await translateChannels.get(newMessage.channelId);
  if (!sourceTrChannel) return;

  // get other channels' linked messages
  const messages = await getMessagesFromMessageLink(
    link,
    newMessage.id,
    newMessage.guild
  );
  if (!messages) return;

  await Promise.all(
    messages.map(async (message) => {
      if (!message) return;
      if (!message.webhookId) return; // make sure it's sent by the webhook
      if (message.channel.type !== ChannelType.GuildText) return;

      // translate message
      const targetTrChannel = await translateChannels.get(message.channelId);
      if (!targetTrChannel) return;

      try {
        const translatedData = await translateContent(
          newMessage.content!,
          newMessage.guildId!,
          sourceTrChannel.sourceLang,
          targetTrChannel.targetLang
        );

        // edit old message
        const webhook = await webhookCache.get(message.channel);
        await webhook.editMessage(message.id, {
          content: translatedData?.content,
        });

        // notify user if they edited the message over 2K
        if (newMessage.content!.length > DISCORD_MESSAGE_CHARS_LIMIT) {
          await newMessage.reply({
            content: `**Warning:** You edited the message over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be translated.`,
          });
        }
      } catch (error) {
        errorDebug(error);
      }
    })
  );
};

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
