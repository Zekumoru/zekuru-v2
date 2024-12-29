import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { PermissionFlagsBits } from 'discord.js';
import inGuildExecutor from '../executors/inGuildExecutor';
import catchAllExecutor from '../executors/catchAllExecutor';
import inTextChannelExecutor from '../executors/inTextChannelExecutor';
import setAutocompleteExecutor from './executors/autocompleteExecutor';
import setExecutor from './executors/setExecutor';
import deferEphemeralExecutor from '../executors/deferEphemeralExecutor';
import isRegisteredExecutor from '../executors/isRegisteredExecutor';

const setCommand = new DiscordCommandBuilder()
  .setName('set')
  .setDescription(`Set a channel's language.`)
  .addStringOption((option) =>
    option
      .setName('language')
      .setDescription('The language to set.')
      .setAutocomplete(true)
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription(
        'The channel to set the language of. If not specified, defaults to current channel.'
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setAutocompleteExecutor(setAutocompleteExecutor)
  .setExecutors((executors) =>
    executors
      .add(inGuildExecutor)
      .add(inTextChannelExecutor)
      .add(deferEphemeralExecutor)
      .add(isRegisteredExecutor)
      .add(setExecutor)
      .catch(catchAllExecutor)
  );

export default setCommand;
