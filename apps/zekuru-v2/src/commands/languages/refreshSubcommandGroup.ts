import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import refreshDeeplSubcommand from './subcommands/refresh/deepl';

const refreshSubcommandGroup = (
  subcommandGroup: SlashCommandSubcommandGroupBuilder
) =>
  subcommandGroup
    .setName('refresh')
    .setDescription(
      'Refresh supported languages of a certain API (if supported).'
    )
    .addSubcommand(refreshDeeplSubcommand);

export default refreshSubcommandGroup;
