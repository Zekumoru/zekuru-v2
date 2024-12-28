import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import listLanguagesSubcommand from './subcommands/languages';
import listLanguagesHandler from './handlers/languages';
import catchAllExecutor from '../executors/catchAllExecutor';

const listHandlers = {
  languages: listLanguagesHandler,
};

const listCommand = new DiscordCommandBuilder()
  .setName('list')
  .setDescription('List a particular thing like channels, languages, etc.')
  .addSubcommand(listLanguagesSubcommand)
  .setExecutors((executors) =>
    executors
      .add(async ({ interaction }) => {
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand(true);

        await listHandlers[subcommand](interaction);
      })
      .catch(catchAllExecutor)
  );

export default listCommand;
