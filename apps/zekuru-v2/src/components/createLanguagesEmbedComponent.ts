import { ApiType } from '@zekuru-v2/types';
import ApiLanguagesCache from '../cache/ApiLanguagesCache';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

export type CreateLanguagesEmbedComponentOptions = {
  api: ApiType;
  index: number;
  indexType: 'start' | 'end';
  range?: number;
};

export const LanguagesEmbedComponentIds = {
  PREV: 'prev-list-languages',
  NEXT: 'next-list-languages',
};

const createLanguagesEmbedComponent = async ({
  api,
  indexType,
  index: tempIndex,
  range: customRange,
}: CreateLanguagesEmbedComponentOptions) => {
  const range = customRange ?? 24;
  const index = indexType === 'end' ? tempIndex - range : tempIndex;

  const languages = await ApiLanguagesCache.get(api as ApiType);

  const showStart = index + 1;
  const showEnd =
    index + range > languages.length ? languages.length : index + range;
  const embed = new EmbedBuilder()
    .setTitle(`Supported languages of \`${api}\``)
    .addFields(
      languages
        .slice(index, index + range)
        .map(({ code, name }) => ({ name: code, value: name, inline: true }))
    )
    .setFooter({
      text: `Showing ${showStart}-${showEnd} of ${languages.length} languages`,
    });

  const prevButton = new ButtonBuilder()
    .setCustomId(LanguagesEmbedComponentIds.PREV)
    .setLabel('Previous')
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(index - range < 0);

  const nextButton = new ButtonBuilder()
    .setCustomId(LanguagesEmbedComponentIds.NEXT)
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(index + range >= languages.length);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    prevButton,
    nextButton
  );

  return [embed, row] as const;
};

export default createLanguagesEmbedComponent;
