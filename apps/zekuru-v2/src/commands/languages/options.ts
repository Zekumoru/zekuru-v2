import { SlashCommandStringOption } from 'discord.js';

export const LanguagesOptions = {
  CODE: 'code',
  LANGUAGE: 'language',
  VARIANTS: 'variants',
  SUPPORTS: 'supports',
};

export const createCodeOption = () =>
  new SlashCommandStringOption()
    .setName(LanguagesOptions.CODE)
    .setDescription(
      'Language code like en, ja, it, etc. NOT variants like en-US, zh-HANS, etc.'
    );

export const createLanguageOption = () =>
  new SlashCommandStringOption()
    .setName(LanguagesOptions.LANGUAGE)
    .setDescription(
      'Language name like english, etc. NOT variants like "English (American)", etc.'
    );

export const createVariantsOption = () =>
  new SlashCommandStringOption()
    .setName(LanguagesOptions.VARIANTS)
    .setDescription(
      'List of variants comma-separated. Format: en-US: English (American), etc.'
    );

export const createSupportsOption = () =>
  new SlashCommandStringOption()
    .setName(LanguagesOptions.SUPPORTS)
    .setDescription(
      'API services which supports this language. Format: openai, gemini, etc. Deepl is ignored.'
    );
