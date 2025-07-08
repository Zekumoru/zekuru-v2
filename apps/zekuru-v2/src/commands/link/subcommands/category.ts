import { SlashCommandSubcommandBuilder } from 'discord.js';
import LinkOptions from '../LinkOptions';

const linkCategorySubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('category')
    .setDescription('Links channels of a category to each other.')
    .addChannelOption((option) =>
      option
        .setName(LinkOptions.Group.CATEGORY_CHANNEL)
        .setDescription(`The category to link its channels to each other.`),
    )
    .addBooleanOption((option) =>
      option
        .setName(LinkOptions.Multiple.RECURSIVE)
        .setDescription(`Also link between channel's links. Default is true.`),
    );

export default linkCategorySubcommand;
