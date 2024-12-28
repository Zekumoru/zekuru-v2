import { apiTypes } from '@zekuru-v2/types';
import { SlashCommandSubcommandBuilder } from 'discord.js';

const listLanguagesSubcommand = (subcommand: SlashCommandSubcommandBuilder) =>
  subcommand
    .setName('languages')
    .setDescription('List supported languages of an API.')
    .addStringOption((option) =>
      option
        .setName('api')
        .setDescription('The API to list its supported languages.')
        .setRequired(true)
        .addChoices(apiTypes.map((api) => ({ name: api, value: api })))
    );

export default listLanguagesSubcommand;
