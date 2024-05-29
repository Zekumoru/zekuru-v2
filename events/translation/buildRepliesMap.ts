import { Collection, EmbedBuilder, Message, TextChannel } from 'discord.js';
import buildReplyEmbed from './buildReplyEmbed';

export interface IRepliesMapEntry {
  embed: EmbedBuilder;
  message: Message;
  authorId: string | undefined;
}

export type TRepliesMap = Collection<string, IRepliesMapEntry>;

const buildRepliesMap = async (message: Message, channels: TextChannel[]) => {
  const repliesMap: TRepliesMap = new Collection();

  // check if message has reply
  if (message.reference) {
    await Promise.all(
      channels.map(async (channel) => {
        if (!channel) return;
        const reply = await buildReplyEmbed(message, channel);
        if (!reply) return;

        repliesMap.set(channel.id, reply);
      })
    );
  }

  return repliesMap;
};

export default buildRepliesMap;
