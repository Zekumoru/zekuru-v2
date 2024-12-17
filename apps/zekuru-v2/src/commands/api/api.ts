import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { PermissionFlagsBits } from 'discord.js';
import registerSubcommandGroup from './registerSubcommandGroup';
import unregisterSubcommandGroup from './unregisterSubcommandGroup';
import createNoopHandler from './handlers/createNoopHandler';
import deeplRegisterHandler from './handlers/deepl/deeplRegisterHandler';
import deeplUnregisterHandler from './handlers/deepl/deeplUnregisterHandler';

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
  .setExecutor(async (interaction) => {
    const subcommandGroup = interaction.options.getSubcommandGroup(true);
    const subcommand = interaction.options.getSubcommand(true);

    apiHandler[subcommandGroup][subcommand](interaction);
  });

export default apiCommand;
