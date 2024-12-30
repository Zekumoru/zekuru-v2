import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import { PermissionFlagsBits } from 'discord.js';
import catchAllExecutor from '../executors/catchAllExecutor';
import inGuildExecutor from '../executors/inGuildExecutor';
import inTextChannelExecutor from '../executors/inTextChannelExecutor';
import LinkOptions from './LinkOptions';
import validateChannelsExecutor from './executors/validateChannelsExecutor';
import deferExecutor from '../executors/deferExecutor';

const linkCommand = new DiscordCommandBuilder()
  .setName('link')
  .setDescription('Links two translation channels.')
  .addChannelOption((option) =>
    option
      .setName(LinkOptions.TARGET_CHANNEL)
      .setDescription('The target channel to link.')
      .setRequired(true)
  )
  .addChannelOption((option) =>
    option
      .setName(LinkOptions.SOURCE_CHANNEL)
      .setDescription(
        'The source channel to link. If not provided, takes the current channel as the source.'
      )
  )
  .addStringOption((option) =>
    option
      .setName(LinkOptions.MODE)
      .setDescription('Specify linking mode. Default is `bi-recursive`.')
      .addChoices(
        Object.values(LinkOptions.mode).map((mode) => ({
          name: mode,
          value: mode,
        }))
      )
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setExecutors((executors) =>
    executors
      .add(inGuildExecutor)
      .add(inTextChannelExecutor)
      .add(deferExecutor)
      .add(validateChannelsExecutor)
      .add(async ({ interaction }) => {
        await interaction.editReply('To be implemented.');
      })
      .catch(catchAllExecutor)
  );

export default linkCommand;
