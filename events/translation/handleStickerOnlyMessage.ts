import { Message, TextChannel } from 'discord.js';
import cache from '../../cache';
import { TRepliesMap } from './buildRepliesMap';
import getUsernameAndAvatarURL from './getUsernameAndAvatarURL';
import addReplyPing from './addReplyPing';

const handleStickerOnlyMessage = async (
  message: Message,
  channels: TextChannel[],
  repliesMap: TRepliesMap
) => {
  const sticker = message.stickers.map((sticker) => sticker)[0];
  if (!sticker) return;

  return await Promise.all(
    channels.map(async (channel) => {
      const webhook = await cache.webhook.get(channel);
      const reply = repliesMap.get(channel.id);

      const [username, avatarURL] = getUsernameAndAvatarURL(message);
      return await webhook.send({
        username,
        avatarURL,
        content: addReplyPing(
          `https://media.discordapp.net/stickers/${sticker.id}.webp`,
          reply?.authorId
        ),
        embeds: reply ? [reply.embed] : undefined,
      });
    })
  );
};

export default handleStickerOnlyMessage;
