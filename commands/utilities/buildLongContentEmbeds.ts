import { EmbedBuilder } from 'discord.js';

const buildLongContentEmbeds = (content: string) => {
  // 2000 is the Discord character limit
  const splitted = content.match(/(\r\n|\r|\n|.){1,4096}/g);

  const embeds =
    splitted?.map((token) =>
      new EmbedBuilder().setColor(0x0099ff).setDescription(token)
    ) ?? [];

  return embeds.length > 10 ? embeds.slice(0, 10) : embeds;
};

export default buildLongContentEmbeds;
