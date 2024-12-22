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

export type Executor<TInteraction, TContext> = Middleware<
  [interaction: TInteraction, context: TContext]
>;

export type ComposedExecute<TInteraction, TContext> = (
  interaction: TInteraction,
  context: TContext
) => Promise<void>;

export interface Executors {
  readonly autocompleteExecute?: AutocompleteExecutor;
  setAutocompleteExecutor(execute: AutocompleteExecutor): this;

  readonly execute?: ComposedCommandExecute;
  setExecutors<
    TContext,
    TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
  >(
    executors: (
      builder: CommandExecutorBuilder<TContext, TInteraction>
    ) => CommandExecutorBuilder<TContext, TInteraction>
  ): this;
}
