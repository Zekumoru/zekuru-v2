import { SlashCommandSubcommandBuilder } from 'discord.js';
import LinkOptions from '../LinkOptions';

const linkMultipleSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('multiple')
    .setDescription('Link multiple translation channels at once.')
    .addStringOption((option) =>
      option
        .setName(LinkOptions.Multiple.CHANNELS)
        .setDescription(
          `List of channels to link. E.g. '#channel1 #channel2 ... #channelN'`
        )
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName(LinkOptions.Multiple.RECURSIVE)
        .setDescription(`Also link between channel's links. Default is true.`)
    );

export default linkMultipleSubcommand;
