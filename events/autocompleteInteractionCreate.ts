import { CacheType, Events, Interaction } from 'discord.js';
import { DiscordEvent } from '../types/DiscordEvent';
import { errorDebug } from '../utils/logger';

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
      errorDebug(error);
    }
  },
} as DiscordEvent;
