import { SlashCommandSubcommandBuilder } from 'discord.js';
import LinkOptions from '../LinkOptions';

const linkSingleSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('single')
    .setDescription('Links two translation channels.')
    .addChannelOption((option) =>
      option
        .setName(LinkOptions.Single.TARGET_CHANNEL)
        .setDescription('The target channel to link.')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName(LinkOptions.Single.SOURCE_CHANNEL)
        .setDescription(
          'The source channel to link. If not provided, takes the current channel as the source.'
        )
    )
    .addStringOption((option) =>
      option
        .setName(LinkOptions.Single.MODE)
        .setDescription('Specify linking mode. Default is `bi-recursive`.')
        .addChoices(
          Object.values(LinkOptions.Single.mode).map((mode) => ({
            name: mode,
            value: mode,
          }))
        )
    );

export default linkSingleSubcommand;
