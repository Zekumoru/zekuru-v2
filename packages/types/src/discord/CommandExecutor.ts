/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatInputCommandInteraction } from 'discord.js';
import { ComposedExecute, Executor } from './Executors';
import { ExecutorBuilder } from './ExecutorBuilder';

// As you might notice, all executor utilities here have the context
// first, why? This is so we can set the context first without caring
// about the inferred interaction.
export type CommandExecutor<
  TContext = any,
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> = Executor<TInteraction, TContext>;

export type ComposedCommandExecute<
  TContext = any,
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> = ComposedExecute<TInteraction, TContext>;

export type CommandExecutorBuilder<
  TContext = any,
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> = ExecutorBuilder<TInteraction, TContext>;
