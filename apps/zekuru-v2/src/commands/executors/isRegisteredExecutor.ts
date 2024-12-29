/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InGuild, InteractionExecutor } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';
import GuildCache from '../../cache/GuildCache';

const isRegisteredExecutor: InteractionExecutor<
  {},
  InGuild<ChatInputCommandInteraction>
> = async ({ interaction }, next) => {
  const guild = await GuildCache.get(interaction.guildId);
  const api = guild?.translation.credentials[0];
  const message = `You must be registered first before using this command! Please use the \`/api register\` command.`;

  if (!guild || !api) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(message);
    } else {
      await interaction.reply(message);
    }
    return;
  }

  await next();
};

export default isRegisteredExecutor;
