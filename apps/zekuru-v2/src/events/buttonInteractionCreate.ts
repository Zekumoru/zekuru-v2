/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApiType, DiscordEvent } from '@zekuru-v2/types';
import { ButtonInteraction, CacheType, Events, Interaction } from 'discord.js';
import createLanguagesEmbedComponent, {
  LanguagesEmbedComponentIds,
} from '../components/createLanguagesEmbedComponent';

const handlers = {
  [LanguagesEmbedComponentIds.PREV]: async (interaction: ButtonInteraction) => {
    const oldEmbed = interaction.message.embeds[0];

    const api = oldEmbed.title!.match(/`.*`/i)![0].match(/[^`]+/i)![0];

    const footer = oldEmbed.footer!.text;
    const index = +footer.slice('Showing '.length, footer.indexOf('-'));

    const [embed, row] = await createLanguagesEmbedComponent({
      api: api as ApiType,
      index: index - 1,
      indexType: 'end',
    });

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
  [LanguagesEmbedComponentIds.NEXT]: async (interaction: ButtonInteraction) => {
    const oldEmbed = interaction.message.embeds[0];

    const api = oldEmbed.title!.match(/`.*`/i)![0].match(/[^`]+/i)![0];

    const footer = oldEmbed.footer!.text;
    const index = +footer.slice('Showing '.length, footer.indexOf('-'));

    const [embed, row] = await createLanguagesEmbedComponent({
      api: api as ApiType,
      index,
      indexType: 'start',
    });

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
};

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction<CacheType>) => {
    if (!interaction.isButton()) return;

    await interaction.deferUpdate();

    const id = interaction.customId;

    await handlers[id](interaction);
  },
} as DiscordEvent;
