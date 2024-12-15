import { DiscordCommand, DiscordEvent } from '@zekuru-v2/types';
import { DiscordCommandBuilder, logger } from '@zekuru-v2/utils';
import { CacheType, Events, Interaction } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction<CacheType>) => {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    const autocompleteCommand =
      command instanceof DiscordCommandBuilder
        ? command.autocompleteExecutor
        : (command as DiscordCommand).autocomplete;
    if (!autocompleteCommand) return;

    try {
      await autocompleteCommand(interaction);
    } catch (error) {
      logger.error(error);
    }
  },
} as DiscordEvent;
