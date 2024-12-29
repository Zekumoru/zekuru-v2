import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import refreshDeeplSubcommand from './subcommands/refresh/deepl';
import refreshGeminiSubcommand from './subcommands/refresh/gemini';
import refreshOpenAISubcommand from './subcommands/refresh/openai';

const refreshSubcommandGroup = (
  subcommandGroup: SlashCommandSubcommandGroupBuilder
) =>
  subcommandGroup
    .setName('refresh')
    .setDescription('Refresh supported languages of a certain API.')
    .addSubcommand(refreshDeeplSubcommand)
    .addSubcommand(refreshOpenAISubcommand)
    .addSubcommand(refreshGeminiSubcommand);

export default refreshSubcommandGroup;
