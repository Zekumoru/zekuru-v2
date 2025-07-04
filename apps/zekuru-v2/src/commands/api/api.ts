import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import registerSubcommandGroup from './registerSubcommandGroup';
import unregisterSubcommandGroup from './unregisterSubcommandGroup';
import createNoopHandler from './handlers/createNoopHandler';
import deeplRegisterHandler from './handlers/deepl/deeplRegisterHandler';
import deeplUnregisterHandler from './handlers/deepl/deeplUnregisterHandler';
import inGuildExecutor from '../executors/inGuildExecutor';
import invalidDeeplKeyExecutor from './executors/invalidDeeplKeyExecutor';
import catchAllExecutor from '../executors/catchAllExecutor';

const apiHandler = {
  register: {
    deepl: deeplRegisterHandler,
    openai: createNoopHandler('OpenAI is not supported yet.'),
    gemini: createNoopHandler('Gemini is not supported yet.'),
  },
  unregister: {
    deepl: deeplUnregisterHandler,
    openai: createNoopHandler('OpenAI is not supported yet.'),
    gemini: createNoopHandler('Gemini is not supported yet.'),
  },
};

const apiCommand = new DiscordCommandBuilder()
  .setName('api')
  .setDescription('Configure translation APIs.')
  .addSubcommandGroup(registerSubcommandGroup)
  .addSubcommandGroup(unregisterSubcommandGroup)
  // Change permissions later when finished implementing
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setExecutors((executors) =>
    executors
      .add(inGuildExecutor)
      .add(async ({ interaction }) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const subcommandGroup = interaction.options.getSubcommandGroup(true);
        const subcommand = interaction.options.getSubcommand(true);

        await apiHandler[subcommandGroup][subcommand](interaction);
      })
      .catch(invalidDeeplKeyExecutor)
      .catch(catchAllExecutor),
  );

export default apiCommand;
