import { Collection } from 'discord.js';
import { Executors } from '../discord/Executors';
import { SlashCommandBuilderAddon } from '../discord/SlashCommandBuilderAddon';
import { DiscordCommand } from '../discord';

type DiscordCommandBuilder = Executors & SlashCommandBuilderAddon;

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, DiscordCommand | DiscordCommandBuilder>;
    cooldowns: Collection<string, Collection<string, number>>;
  }

  interface SharedSlashCommand extends Executors, SlashCommandBuilderAddon {}
}

export {};
