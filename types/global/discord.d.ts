import { Client, Collection } from 'discord.js';
import { DiscordCommand } from '../DiscordCommand';

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, DiscordCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}

export {};
