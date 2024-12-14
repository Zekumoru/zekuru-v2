import { Collection } from 'discord.js';
import { DiscordCommand } from '../DiscordCommand';
import { Executors } from '../discord/Executors';
import { SlashCommandBuilderAddon } from '../discord/SlashCommandBuilderAddon';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, DiscordCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
  }

  interface SharedSlashCommand extends Executors, SlashCommandBuilderAddon {}
}

export {};
