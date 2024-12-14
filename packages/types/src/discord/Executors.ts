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
  readonly autocompleteExecutor?: AutocompleteExecutor;
  setAutocompleteExecutor(executor: AutocompleteExecutor): this;

  readonly executor?: ChatInputCommandExecutor;
  setExecutor(executor: ChatInputCommandExecutor): this;
}
