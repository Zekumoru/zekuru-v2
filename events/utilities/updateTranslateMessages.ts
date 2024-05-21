import { ChannelType, Message, PartialMessage } from 'discord.js';
import MessageLink from '../../db/models/MessageLink';
import cache from '../../cache';
import getMessagesFromMessageLink from '../../commands/utilities/getMessagesFromMessageLink';
import { errorDebug } from '../../utilities/logger';
import translateContent from '../translation/translateContent';
import { DISCORD_MESSAGE_CHARS_LIMIT } from '../translation/limits';

const updateTranslateMessages = async (
  newMessage: Message<boolean> | PartialMessage
) => {
  if (!newMessage.guild) return;

  // get message link
  const link = await MessageLink.findOne({ messageId: newMessage.id });
  if (!link) return;

  // check if the edited message's translate channel exists
  const sourceTrChannel = await cache.translateChannel.get(
    newMessage.channelId
  );
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
      const targetTrChannel = await cache.translateChannel.get(
        message.channelId
      );
      if (!targetTrChannel) return;

      try {
        const translatedData = await translateContent(
          newMessage.content!,
          newMessage.guildId!,
          sourceTrChannel.sourceLang,
          targetTrChannel.targetLang
        );

        // edit old message
        const webhook = await cache.webhook.get(message.channel);
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

export default updateTranslateMessages;
