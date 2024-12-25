import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import queryLanguageSubcommand from './subcommands/query';
import insertLanguageSubcommand from './subcommands/insert';
import updateLanguageSubcommand from './subcommands/update';
import removeLanguageSubcommand from './subcommands/remove';
import { LanguagesOptions } from './options';
import insertLanguageHandler from './handlers/insert';
import catchAllExecutor from '../executors/catchAllExecutor';
import queryLanguageHandler from './handlers/query';
import updateLanguageHandler from './handlers/update';

const languagesNoopHandler = async (
  interaction: ChatInputCommandInteraction
) => {
  const code = interaction.options.getString(LanguagesOptions.CODE);
  const language = interaction.options.getString(LanguagesOptions.LANGUAGE);
  const variants = interaction.options.getString(LanguagesOptions.VARIANTS);
  const supports = interaction.options.getString(LanguagesOptions.SUPPORTS);

  await interaction.editReply(
    `Not implemented yet!\nCode: \`${code}\`\nLanguage: \`${language}\`\nVariants: \`${variants}\`\nAPIs: \`${supports}\``
  );
};

const languagesHandlers = {
  query: queryLanguageHandler,
  insert: insertLanguageHandler,
  update: updateLanguageHandler,
  remove: languagesNoopHandler,
};

const languagesCommand = new DiscordCommandBuilder()
  .setName('languages')
  .setDescription(
    'Utility command to dynamically modify supported languages of different translation APIs.'
  )
  .setDevOnly(true)
  .addSubcommand(queryLanguageSubcommand)
  .addSubcommand(insertLanguageSubcommand)
  .addSubcommand(updateLanguageSubcommand)
  .addSubcommand(removeLanguageSubcommand)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setExecutors((executors) =>
    executors
      .add(async ({ interaction }) => {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand(true);

        await languagesHandlers[subcommand](interaction);
      })
      .catch(catchAllExecutor)
  );

export default languagesCommand;
