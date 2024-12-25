import { ChatInputCommandInteraction } from 'discord.js';
import { LanguagesOptions } from '../options';
import languagesRepository from '../languagesRepository';
import parseVariants from '../parseVariants';
import parseSupports from '../parseSupports';

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
