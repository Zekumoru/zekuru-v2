import { ChatInputCommandInteraction } from 'discord.js';
import { ComposedExecute, Executor } from './Executors';
import { ExecutorBuilder } from './ExecutorBuilder';

export type CommandExecutorParams<T extends ChatInputCommandInteraction> = [
  interaction: T
];

export type CommandExecutor<
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> = Executor<CommandExecutorParams<TInteraction>>;

export type ComposedCommandExecute<
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> = ComposedExecute<CommandExecutorParams<TInteraction>>;

export type CommandExecutorBuilder<
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> = ExecutorBuilder<CommandExecutorParams<TInteraction>>;
