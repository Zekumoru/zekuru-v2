import { EmbedBuilder } from 'discord.js';

const buildEmbed = (name: string, iconURL: string, content: string) => {
  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setAuthor({
      name,
      iconURL,
    })
    .setDescription(content);
};

export default buildEmbed;
