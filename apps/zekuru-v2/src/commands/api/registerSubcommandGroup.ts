import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import registerDeeplSubcommand from './subcommands/deepl/registerDeeplSubcommand';
import registerOpenAISubcommand from './subcommands/openai/registerOpenAISubcommand';
import registerGeminiSubcommand from './subcommands/gemini/registerGeminiSubcommand';

const registerSubcommandGroup = (
  subcommandGroup: SlashCommandSubcommandGroupBuilder
) =>
  subcommandGroup
    .setName('register')
    .setDescription('Register a translation API to use.')
    .addSubcommand(registerDeeplSubcommand)
    .addSubcommand(registerOpenAISubcommand)
    .addSubcommand(registerGeminiSubcommand);

export default registerSubcommandGroup;
