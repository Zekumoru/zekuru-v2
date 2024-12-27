import { ChatInputCommandInteraction } from 'discord.js';
import openaiLanguages from './openai/openaiLanguages';
import createGroupMap from './shared/createGroupMap';
import refreshCommon from './shared/refreshCommon';

const refreshOpenAIHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const languagesMap = new Map<string, string>();
  openaiLanguages.forEach(({ code, name }) => languagesMap.set(code, name));

  const groupMap = createGroupMap(languagesMap);
  const userId = interaction.user.id;

  await refreshCommon(userId, 'openai', groupMap);

  await interaction.editReply(
    `OpenAI's supported languages has been successfully refreshed!`
  );
};

export default refreshOpenAIHandler;
