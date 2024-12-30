import { Channel, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import LinkOptions from '../../LinkOptions';
import validateChannel from '../../validateChannel';
import { InGuild, InTextChannel } from '@zekuru-v2/types';

export type ValidationChannelsResultWarn = { warning: string | undefined };

export type ValidationChannelsResultOk = {
  warning: undefined;
  sourceChannel: TextChannel;
  targetChannel: TextChannel;
};

export type ValidationChannelsResult =
  | ValidationChannelsResultWarn
  | ValidationChannelsResultOk;

const validateChannels = async (
  interaction: InTextChannel<InGuild<ChatInputCommandInteraction>>
): Promise<ValidationChannelsResult> => {
  const sourceChannel =
    interaction.options.getChannel(LinkOptions.Single.SOURCE_CHANNEL) ??
    interaction.channel;
  const targetChannel = interaction.options.getChannel(
    LinkOptions.Single.TARGET_CHANNEL,
    true
  );

  const sourceWarning = await validateChannel(sourceChannel as Channel);
  const targetWarning = await validateChannel(targetChannel as Channel);

  if (sourceWarning || targetWarning) {
    const warning = `Cannot link <#${sourceChannel.id}> with <#${
      targetChannel.id
    }> because:${sourceWarning ? `\n- ${sourceWarning}` : ''}${
      targetWarning ? `\n- ${targetWarning}` : ''
    }`;
    return { warning };
  }

  return {
    warning: undefined,
    sourceChannel: sourceChannel as TextChannel,
    targetChannel: targetChannel as TextChannel,
  };
};

export default validateChannels;
