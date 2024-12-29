import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { PermissionFlagsBits } from 'discord.js';
import inGuildExecutor from '../executors/inGuildExecutor';
import inTextChannelExecutor from '../executors/inTextChannelExecutor';
import deferEphemeralExecutor from '../executors/deferEphemeralExecutor';
import catchAllExecutor from '../executors/catchAllExecutor';
import unsetExecutor from './executors/unsetExecutor';

const unsetCommand = new DiscordCommandBuilder()
  .setName('unset')
  .setDescription(`Unset a channel's language`)
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription(
        'The channel to unset the language of. If not specified, defaults to current channel.'
      )
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setExecutors((executors) =>
    executors
      .add(inGuildExecutor)
      .add(inTextChannelExecutor)
      .add(deferEphemeralExecutor)
      .add(unsetExecutor)
      .catch(catchAllExecutor)
  );

export default unsetCommand;
