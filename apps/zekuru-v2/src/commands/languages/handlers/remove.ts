import { ChatInputCommandInteraction } from 'discord.js';
import { LanguagesOptions } from '../options';
import languagesRepository from '../languagesRepository';

const removeLanguageHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const code = interaction.options.getString(LanguagesOptions.CODE, true);

  const successful = await languagesRepository.deleteById(code);

  if (!successful) {
    await interaction.editReply(
      `The language code \`${code}\` cannot be removed because it does not exist.`
    );
    return;
  }

  await interaction.editReply(
    `Language code \`${code}\` successfully removed!`
  );
};

export default removeLanguageHandler;
