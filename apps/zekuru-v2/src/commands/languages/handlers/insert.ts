import { ChatInputCommandInteraction } from 'discord.js';
import { LanguagesOptions } from '../options';
import { LanguageVariant } from '@zekuru-v2/entities';
import languagesRepository from '../languagesRepository';

const VARIANTS_REGEX = /([^,]*):([^,]*),?/gi;
const parseVariants = (input: string) => {
  const matches = input.matchAll(VARIANTS_REGEX);
  const variants: LanguageVariant[] = [];

  for (const match of matches) {
    const code = match[1].trim();
    const name = match[2].trim();
    variants.push({ code, name });
  }

  return variants;
};

const parseSupports = (input: string) => {
  return input.split(',').map((token) => token.trim());
};

const insertLanguageHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const code = interaction.options.getString(LanguagesOptions.CODE, true);
  const language = interaction.options.getString(
    LanguagesOptions.LANGUAGE,
    true
  );
  const variants = parseVariants(
    interaction.options.getString(LanguagesOptions.VARIANTS, true)
  );
  const supports = parseSupports(
    interaction.options.getString(LanguagesOptions.SUPPORTS, true)
  );

  const userId = interaction.user.id;

  const inserted = await languagesRepository.insertOne({
    _id: code,
    name: language,
    createdBy: userId,
    modifiedBy: userId,
    variants,
    supports,
  });

  await interaction.editReply(
    `Successfully added new supported language!\n${inserted.toString()}`
  );
};

export default insertLanguageHandler;
