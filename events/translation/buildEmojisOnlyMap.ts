import { Collection, Message, PartialMessage } from 'discord.js';
import { ITranslateChannel } from '../../db/models/TranslateChannel';

const buildEmojisOnlyMap = (
  message: Message | PartialMessage,
  trChannels: ITranslateChannel[]
) => {
  const messageContent = message.content;
  if (!messageContent) return;

  // Only handle emoji-only message if the message isn't replying to anything.
  // Why? Because sending a link with a reply embed doesn't show the emoji.
  if (message.reference) return;

  const emojiTag = messageContent.trim().match(/^<a?:[^<>]*:\d*>$/)?.[0];
  if (!emojiTag) return;

  const emojisOnlyMap = new Collection<string, string>();

  // check if message is emoji only (and does not have reply)
  trChannels.forEach((trChannel) => {
    const [animRaw, _name, idRaw] = emojiTag.split(':');
    const emojiId = idRaw.slice(0, idRaw.length - 1);

    let content = messageContent;
    // only swap emoji with image if the bot doesn't have it
    if (!message.client.emojis.cache.find((emoji) => emoji.id === emojiId)) {
      const ext = animRaw[1] === 'a' ? 'gif' : 'png';
      content = `https://media.discordapp.net/emojis/${emojiId}.${ext}?size=48`;
    }

    emojisOnlyMap.set(trChannel.id, content);
  });

  return emojisOnlyMap;
};

export default buildEmojisOnlyMap;
