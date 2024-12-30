import { SlashCommandSubcommandBuilder } from 'discord.js';
import LinkOptions from '../LinkOptions';

const linkGroupSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('group')
    .setDescription('Links channels of a category to each other.')
    .addChannelOption((option) =>
      option
        .setName(LinkOptions.Group.CATEGORY_CHANNEL)
        .setDescription(`The category to link its channels to each other.`)
        .setRequired(true)
    );

export default linkGroupSubcommand;
