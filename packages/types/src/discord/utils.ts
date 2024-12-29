/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { ExtractThisPredicate } from '../utils';

export type InGuild<T extends ChatInputCommandInteraction> = T &
  ExtractThisPredicate<ChatInputCommandInteraction['inGuild']>;

export type InTextChannel<T extends ChatInputCommandInteraction> = T & {
  channel: TextChannel;
};

export type GetContextParam<T extends (...args: any[]) => any> = T extends (
  ...args: infer Args
) => any
  ? Omit<Args[0], 'interaction'>
  : never;

export type GetInteractionParam<T extends (...args: any[]) => any> = T extends (
  ...args: [infer FirstArg, ...any[]]
) => any
  ? 'interaction' extends keyof FirstArg
    ? FirstArg['interaction']
    : never
  : never;
