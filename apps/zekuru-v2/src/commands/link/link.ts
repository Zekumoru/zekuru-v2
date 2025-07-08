import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { PermissionFlagsBits } from 'discord.js';
import catchAllExecutor from '../executors/catchAllExecutor';
import inGuildExecutor from '../executors/inGuildExecutor';
import inTextChannelExecutor from '../executors/inTextChannelExecutor';
import deferExecutor from '../executors/deferExecutor';
import linkSingleSubcommand from './subcommands/single';
import linkSingleHandler from './handlers/single';
import linkMultipleSubcommand from './subcommands/multiple';
import linkCategorySubcommand from './subcommands/category';
import linkMultipleHandler from './handlers/multiple';
import linkCategoryHandler from './handlers/category';

const handlers = {
  single: linkSingleHandler,
  multiple: linkMultipleHandler,
  category: linkCategoryHandler,
};

const linkCommand = new DiscordCommandBuilder()
  .setName('link')
  .setDescription('Links translation channels.')
  .addSubcommand(linkSingleSubcommand)
  .addSubcommand(linkMultipleSubcommand)
  .addSubcommand(linkCategorySubcommand)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setExecutors((executors) =>
    executors
      .add(inGuildExecutor)
      .add(inTextChannelExecutor)
      .add(deferExecutor)
      .add(async ({ interaction }) => {
        const subcommand = interaction.options.getSubcommand(true);
        const handler = handlers[subcommand];

        if (!handler) {
          await interaction.editReply(
            `Unsupported subcommand \`${subcommand}\`.`,
          );
          return;
        }

        handler(interaction);
      })
      .catch(catchAllExecutor),
  );

export default linkCommand;
