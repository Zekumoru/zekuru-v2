import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import unregisterDeeplSubcommand from './subcommands/deepl/unregisterDeeplSubcommand';
import unregisterOpenAISubcommand from './subcommands/openai/unregisterOpenAISubcommand';
import unregisterGeminiSubcommand from './subcommands/gemini/unregisterGeminiSubcommand';

const unregisterSubcommandGroup = (
  subcommandGroup: SlashCommandSubcommandGroupBuilder
) =>
  subcommandGroup
    .setName('unregister')
    .setDescription('Unregister a translation API.')
    .addSubcommand(unregisterDeeplSubcommand)
    .addSubcommand(unregisterOpenAISubcommand)
    .addSubcommand(unregisterGeminiSubcommand);

export default unregisterSubcommandGroup;
