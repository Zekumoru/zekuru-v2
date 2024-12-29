import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import queryLanguageSubcommand from './subcommands/query';
import insertLanguageSubcommand from './subcommands/insert';
import updateLanguageSubcommand from './subcommands/update';
import removeLanguageSubcommand from './subcommands/remove';
import insertLanguageHandler from './handlers/insert';
import catchAllExecutor from '../executors/catchAllExecutor';
import queryLanguageHandler from './handlers/query';
import updateLanguageHandler from './handlers/update';
import removeLanguageHandler from './handlers/remove';
import { PermissionFlagsBits } from 'discord.js';
import refreshSubcommandGroup from './refreshSubcommandGroup';
import refreshDeeplHandler from './handlers/refresh/deepl';
import refreshOpenAIHandler from './handlers/refresh/openai';
import refreshGeminiHandler from './handlers/refresh/gemini';

const languagesHandlers = {
  query: queryLanguageHandler,
  insert: insertLanguageHandler,
  update: updateLanguageHandler,
  remove: removeLanguageHandler,
  refresh: {
    deepl: refreshDeeplHandler,
    openai: refreshOpenAIHandler,
    gemini: refreshGeminiHandler,
  },
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
  .addSubcommandGroup(refreshSubcommandGroup)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setExecutors((executors) =>
    executors
      .add(async ({ interaction }) => {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand(true);
        const subcommandGroup = interaction.options.getSubcommandGroup();

        if (subcommandGroup) {
          await languagesHandlers[subcommandGroup][subcommand](interaction);
        } else {
          await languagesHandlers[subcommand](interaction);
        }
      })
      .catch(catchAllExecutor)
  );

export default languagesCommand;
