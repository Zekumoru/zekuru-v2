import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import TranslateChannel from '../models/TranslateChannel';
import channelLinks from '../cache/channelLinks';
import { sourceLanguages } from '../translation/languages';
import buildLongContentEmbeds from './utilities/buildLongContentEmbeds';

const data = new SlashCommandBuilder()
  .setName('show-channels')
  .setDescription(
    'Shows the translate channels, ie. channels that are set to a language.'
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

  const trChannels = await TranslateChannel.find({
    guildId: interaction.guildId,
  });
  if (!trChannels.length) {
    interaction.reply({
      content: `There are no translate channels yet. You can start setting them by using the \`/set\` command.`,
    });
    return;
  }

  const strBuilder = await Promise.all<string>(
    trChannels.map(async (trChannel, i) => {
      const chLink = await channelLinks.get(trChannel.id);
      const language =
        sourceLanguages.find((lang) => lang.code === trChannel.sourceLang)
          ?.name ?? trChannel.sourceLang;
      const line = `- <#${trChannel.id}> is set to \`${language}\`${
        chLink
          ? ` and is linked to ${chLink.links.length} translate channels`
          : ` and is **not linked** to any translate channels`
      }.`;

      return line + (i !== trChannels.length - 1 ? '\n' : '');
    })
  );

  // Handle 2K characters limit
  const content = `**Showing all translate channels**\nThere are a total of ${
    trChannels.length
  } translate channels.\n${strBuilder.join('')}`;
  if (content.length <= 2000) {
    interaction.reply({
      content,
    });
    return;
  }

  interaction.reply({
    embeds: buildLongContentEmbeds(content),
  });
};

export default createCommand({
  data,
  execute,
});
