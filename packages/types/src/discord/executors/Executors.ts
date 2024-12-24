/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { CommandExecutorBuilder } from './CommandExecutorBuilder';
import { InteractionExecutorBinder } from './InteractionExecutor';

export type AutocompleteExecutor = (
  interaction: AutocompleteInteraction
) => Promise<void>;

export interface Executors {
  readonly autocompleteExecute?: AutocompleteExecutor;
  setAutocompleteExecutor(execute: AutocompleteExecutor): this;

  readonly bindExecutors?: InteractionExecutorBinder;
  setExecutors<
    TContext extends object = {},
    TError extends Error = Error,
    TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction,
    TBaseContext extends object = TContext
  >(
    executors:
      | CommandExecutorBuilder<TContext, TError, TInteraction, TBaseContext>
      | ((
          builder: CommandExecutorBuilder<
            TContext,
            TError,
            TInteraction,
            TBaseContext
          >
        ) => CommandExecutorBuilder<
          TContext,
          TError,
          TInteraction,
          TBaseContext
        >)
  ): this;
}
