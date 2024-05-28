import { ChannelType, Message, TextChannel } from 'discord.js';
import MessageLink, { IMessageLink } from '../../db/models/MessageLink';
import buildEmbed from '../../commands/utilities/buildEmbed';

const buildReplyEmbed = async (message: Message, replyChannel: TextChannel) => {
  if (!message.reference) return;

  const channel = message.client.channels.cache.get(message.channelId);
  if (!channel) return;
  if (channel.type !== ChannelType.GuildText) return;

  const replyOriginalMessage = await message.fetchReference();
  if (!replyOriginalMessage) return;

  // get the reply message's links
  const messageLink = await MessageLink.findOne<IMessageLink>({
    links: {
      $elemMatch: {
        messageId: replyOriginalMessage.id,
        channelId: message.channelId,
      },
    },
  });
  if (!messageLink) return;

  // get the actual link to the reply message's language
  // meaning use this link for replying
  const link = messageLink.links.find(
    ({ channelId }) => channelId === replyChannel.id
  );
  if (!link) return;

  const replyMessage = await replyChannel.messages.fetch(link.messageId);

  // build content for the reply embed
  let replyContentRaw = replyMessage.content;
  if (replyContentRaw.length > 77)
    replyContentRaw = `${replyContentRaw.slice(0, 77)}...`;
  let replyContent = `**[Replying to:](${replyMessage.url})** ${replyContentRaw}`;

  if (replyContentRaw === '') {
    // check if replying to an attachment
    if (replyMessage.attachments.size) {
      replyContent = `**[Replying to an attachment](${replyMessage.url})** ${replyContentRaw}`;
    } else if (replyMessage.stickers.size) {
      replyContent = `**[Replying to a sticker](${replyMessage.url})**`;
    } else {
      // maybe will change in the future?
      // idk what other attachments there are other than embeds
      replyContent = `**[Replying to an attachment](${replyMessage.url})** ${replyContentRaw}`;
    }
  }

  const authorId = message.author.bot ? message.author.id : undefined;

  return {
    embed: buildEmbed(
      replyMessage.member?.nickname ?? replyMessage.author.displayName,
      replyMessage.member?.avatarURL({ size: 32 }) ??
        replyMessage.author.displayAvatarURL({ size: 32 }),
      replyContent
    ),
    message: replyMessage,
    authorId,
  };
};

export default buildReplyEmbed;
