import { ChannelType, Message } from 'discord.js';
import MessageLink from '../../db/models/MessageLink';

const getOriginalMessage = async (message: Message) => {
  const guild = message.guild;
  if (!guild) return;

  const link = await MessageLink.findOne({
    links: { $elemMatch: { messageId: message.id } },
  });

  if (!link) return;

  const channel = guild.channels.cache.get(link.channelId);

  if (!channel) return;
  if (channel.type !== ChannelType.GuildText) return;

  return await channel.messages.fetch(link.messageId);
};

export default getOriginalMessage;
