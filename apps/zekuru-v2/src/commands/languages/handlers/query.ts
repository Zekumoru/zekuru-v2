import { ChatInputCommandInteraction } from 'discord.js';
import languagesRepository from '../languagesRepository';
import { LanguagesOptions } from '../options';

const queryLanguageHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const code = interaction.options.getString(LanguagesOptions.CODE, true);

  const language = await languagesRepository.findById(code);
  if (!language) {
    await interaction.editReply(
      `The language code you specified \`${code}\` is not supported.`
    );
    return;
  }

  await interaction.editReply(language.toString());
};

export default queryLanguageHandler;
