import { DiscordEvent } from '@zekuru-v2/types';
import { logger } from '@zekuru-v2/utils';
import { CacheType, Events, Interaction } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction<CacheType>) => {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    if (!command.autocomplete) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      logger.error(error);
    }
  },
} as DiscordEvent;
