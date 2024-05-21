import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import { sourceLanguages, targetLanguages } from '../translation/languages';
import translateChannels from '../cache/translateChannels';
import { updateTranslateMessages } from '../events/messageUpdateTranslate';

const data = new SlashCommandBuilder()
  .setName('set')
  .setDescription(`Set a channel's language.`)
  .addStringOption((option) =>
    option
      .setName('language')
      .setDescription('The language to set.')
      .setAutocomplete(true)
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('The channel to set the language of.')
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const autocomplete = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused();
  const choices = sourceLanguages.map((lang) => lang.name);
  const filtered = choices
    .filter((choice) =>
      choice.toLowerCase().startsWith(focusedValue.toLowerCase())
    )
    .slice(0, 25);

  await interaction.respond(
    filtered.map((choice) => ({ name: choice, value: choice }))
  );
};

const execute = async (interaction: ChatInputCommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply({
      content: `This command is only available on servers.`,
    });
    return;
  }

  const guildId = interaction.guildId;
  const channelId =
    interaction.options.getChannel('channel')?.id ?? interaction.channelId;

  const language = interaction.options.getString('language');
  if (!language) {
    await interaction.reply({
      content: `Please specify a language.`,
    });
    return;
  }

  const sourceLang = sourceLanguages.find((lang) =>
    lang.name.includes(language)
  )?.code;
  if (!sourceLang) {
    await interaction.reply({
      content: `Invalid language '${language}'.`,
    });
    return;
  }

  const targetLang = targetLanguages.find((lang) =>
    lang.name.includes(language)
  )?.code;
  if (!targetLang) {
    await interaction.reply({
      content: `Error! Target language is missing. Please contact the developer.`,
    });
    return;
  }

  const trChannel = await translateChannels.get(channelId);

  if (trChannel) {
    const oldLanguage =
      sourceLanguages.find((lang) => lang.code === trChannel.sourceLang)
        ?.name ?? trChannel.sourceLang;

    // if already set with the given language
    if (oldLanguage === language) {
      await interaction.reply({
        content: `<#${channelId}> is already set to \`${language}\`!`,
      });
      return;
    }

    // start asking if change the channel's language
    const confirm = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Yes, change')
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      cancel,
      confirm
    );

    const response = await interaction.reply({
      content: `<#${channelId}> is already set to \`${oldLanguage}\`. Do you want to change it to \`${language}\`?`,
      components: [row],
    });

    try {
      const confirmation = await response.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 30_000,
      });

      if (confirmation.customId === 'confirm') {
        await translateChannels.set(channelId, guildId, sourceLang, targetLang);
        await confirmation.update({
          content: `<#${channelId}> has been changed to \`${language}\`.`,
          components: [],
        });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({
          content: `<#${channelId}>'s language not changed`,
          components: [],
        });
      }

      // reflect updated message to translation channels
      await updateTranslateMessages(confirmation.message);
    } catch (error) {
      const message = await interaction.editReply({
        content: `Confirmation not received within 30 seconds, cancelling.`,
        components: [],
      });

      // reflect updated message to translation channels
      await updateTranslateMessages(message);
    }

    return;
  }

  // set channel's language for the first time
  await translateChannels.set(channelId, guildId, sourceLang, targetLang);
  await interaction.reply({
    content: `<#${channelId}> has been set to \`${language}\`.`,
  });
};

export default createCommand({
  data,
  autocomplete,
  execute,
});
