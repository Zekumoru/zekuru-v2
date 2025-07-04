import { DiscordEvent, DiscordCommand } from '@zekuru-v2/types';
import { DiscordCommandBuilder, logger } from '@zekuru-v2/utils';
import {
  CacheType,
  Collection,
  Events,
  Interaction,
  InteractionReplyOptions,
  MessageFlags,
} from 'discord.js';

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction<CacheType>) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      interaction.reply({
        content: `Error: No command \`/${interaction.commandName}\` found.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const commandName =
      command instanceof DiscordCommandBuilder
        ? command.name
        : (command as DiscordCommand).data.name;

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(commandName)) {
      cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    const defaultCooldownDuration = 1;
    const cooldownAmount =
      (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps?.has(interaction.user.id)) {
      const expirationTime =
        (timestamps.get(interaction.user.id) ?? 0) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        interaction.reply({
          content: `Please wait, you are on a cooldown for \`${commandName}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);

    try {
      if (command instanceof DiscordCommandBuilder) {
        await command.bindExecutors?.({ interaction })();
      } else {
        await (command as DiscordCommand).execute(interaction);
      }
    } catch (error) {
      logger.error(error);

      const errorMessageContent: InteractionReplyOptions = {
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessageContent);
      } else {
        await interaction.reply(errorMessageContent);
      }
    }
  },
} as DiscordEvent;
