import { InGuild, InteractionExecutor, InTextChannel } from '@zekuru-v2/types';
import {
  Channel,
  ChannelType,
  ChatInputCommandInteraction,
  TextChannel,
} from 'discord.js';
import LinkOptions from '../LinkOptions';
import ChannelCache from '../../../cache/ChannelCache';

const validateChannel = async (
  channel: Channel
): Promise<string | undefined> => {
  let warning: string | undefined;

  if (channel.type !== ChannelType.GuildText) {
    warning = `<#${channel.id}> must be a text channel.`;
  }

  if (!(await ChannelCache.has(channel.id))) {
    if (warning) {
      warning = `<#${channel.id}> must be a text channel and a translate channel.`;
    } else {
      warning = `<#${channel.id}> must be a translate channel.`;
    }
  }

  return warning;
};

const validateChannelsExecutor: InteractionExecutor<
  { sourceChannel: TextChannel; targetChannel: TextChannel },
  InTextChannel<InGuild<ChatInputCommandInteraction>>
> = async (ctx, next) => {
  const sourceChannel =
    ctx.interaction.options.getChannel(LinkOptions.SOURCE_CHANNEL) ??
    ctx.interaction.channel;
  const targetChannel = ctx.interaction.options.getChannel(
    LinkOptions.TARGET_CHANNEL,
    true
  );

  const sourceWarning = await validateChannel(sourceChannel as Channel);
  if (!sourceWarning) ctx.sourceChannel = sourceChannel as TextChannel;

  const targetWarning = await validateChannel(targetChannel as Channel);
  if (!targetWarning) ctx.targetChannel = targetChannel as TextChannel;

  if (sourceWarning || targetWarning) {
    ctx.interaction.editReply(
      `Cannot link <#${sourceChannel.id}> with <#${targetChannel.id}> because:${
        sourceWarning ? `\n- ${sourceWarning}` : ''
      }${targetWarning ? `\n- ${targetWarning}` : ''}`
    );
    return;
  }

  await next();
};

export default validateChannelsExecutor;
