/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Middleware } from '../middleware';
import {
  CommandExecutorBuilder,
  ComposedCommandExecute,
} from './CommandExecutor';

export type AutocompleteExecutor = (
  interaction: AutocompleteInteraction
) => Promise<void>;

export type Executor<TParams extends any[]> = Middleware<TParams>;

export type ComposedExecute<TParams extends any[]> = (
  ...args: TParams
) => Promise<void>;

export interface Executors {
  readonly autocompleteExecute?: AutocompleteExecutor;
  setAutocompleteExecutor(execute: AutocompleteExecutor): this;

  readonly execute?: ComposedCommandExecute;
  setExecutors<TInteraction extends ChatInputCommandInteraction>(
    executors: (
      builder: CommandExecutorBuilder<TInteraction>
    ) => CommandExecutorBuilder<TInteraction>
  ): this;
}
