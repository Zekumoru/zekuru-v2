import { ChatInputCommandInteraction } from 'discord.js';
import geminiLanguages from './gemini/geminiLanguages';
import createGroupMap from './shared/createGroupMap';
import refreshCommon from './shared/refreshCommon';

const refreshGeminiHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const languagesMap = new Map<string, string>();
  geminiLanguages.forEach(({ code, name }) => languagesMap.set(code, name));

  const groupMap = createGroupMap(languagesMap);
  const userId = interaction.user.id;

  await refreshCommon(userId, 'gemini', groupMap);

  await interaction.editReply(
    `Gemini's supported languages has been successfully refreshed!`
  );
};

export default refreshGeminiHandler;
