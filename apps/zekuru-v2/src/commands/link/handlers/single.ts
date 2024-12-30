import { InGuild, InTextChannel } from '@zekuru-v2/types';
import validateChannels, {
  ValidationChannelsResultOk,
} from './single/validateChannels';
import { ChatInputCommandInteraction } from 'discord.js';

const linkSingleHandler = async (
  interaction: InTextChannel<InGuild<ChatInputCommandInteraction>>
) => {
  const validationResult = await validateChannels(interaction);
  if (validationResult.warning) {
    await interaction.editReply(validationResult.warning);
    return;
  }

  const { sourceChannel, targetChannel } =
    validationResult as ValidationChannelsResultOk;
  await interaction.editReply(
    `To be implemented but you were trying to link <#${sourceChannel.id}> with <#${targetChannel.id}>`
  );
};

export default linkSingleHandler;
