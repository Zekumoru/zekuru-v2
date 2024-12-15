import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';

export type AutocompleteExecutor = (
  interaction: AutocompleteInteraction
) => Promise<void>;

export type ChatInputCommandExecutor = (
  interaction: ChatInputCommandInteraction
) => Promise<void>;

export interface Executors {
  readonly autocompleteExecute?: AutocompleteExecutor;
  setAutocompleteExecutor(execute: AutocompleteExecutor): this;

  readonly execute?: ChatInputCommandExecutor;
  setExecutor(execute: ChatInputCommandExecutor): this;
}
