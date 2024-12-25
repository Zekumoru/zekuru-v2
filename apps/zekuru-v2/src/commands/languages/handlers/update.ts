import { ChatInputCommandInteraction } from 'discord.js';
import { LanguagesOptions } from '../options';
import parseVariants from '../parseVariants';
import parseSupports from '../parseSupports';
import languagesRepository from '../languagesRepository';

const updateLanguageHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const code = interaction.options.getString(LanguagesOptions.CODE, true);

  const name = interaction.options.getString(LanguagesOptions.LANGUAGE);

  const variantsRaw = interaction.options.getString(LanguagesOptions.VARIANTS);
  const supportsRaw = interaction.options.getString(LanguagesOptions.SUPPORTS);

  const variants = variantsRaw ? parseVariants(variantsRaw) : undefined;
  const supports = supportsRaw ? parseSupports(supportsRaw) : undefined;

  const userId = interaction.user.id;

  const language = await languagesRepository.updateOne({
    _id: code,
    name: name ?? undefined,
    modifiedBy: userId,
    variants,
    supports,
  });

  if (!language) {
    await interaction.editReply(
      `The language code \`${code}\` that you're trying to update does not exist.`
    );
    return;
  }

  await interaction.editReply(
    `Successfully updated \`${
      language.name
    }\` language!\n${language.toString()}`
  );
};

export default updateLanguageHandler;
