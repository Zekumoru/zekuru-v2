import { Awaitable, ChatInputCommandInteraction, ClientEvents, SlashCommandBuilder } from 'discord.js';

export interface Command {
    data: SlashCommandBuilder,
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>,
}

export interface Event {
    name: keyof ClientEvents,
    once?: boolean,
    execute: (...interaction: unknown[]) => Awaitable<void>,
}
