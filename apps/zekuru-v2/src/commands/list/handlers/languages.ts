import { ChatInputCommandInteraction } from 'discord.js';
import { ApiType } from '@zekuru-v2/types';
import createLanguagesEmbedComponent from '../../../components/createLanguagesEmbedComponent';

const listLanguagesHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const api = interaction.options.getString('api', true) as ApiType;

  const [embed, row] = await createLanguagesEmbedComponent({
    api,
    index: 0,
    indexType: 'start',
  });

  await interaction.editReply({ embeds: [embed], components: [row] });
};

export default listLanguagesHandler;
