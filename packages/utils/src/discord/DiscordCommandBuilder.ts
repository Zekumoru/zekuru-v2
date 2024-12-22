import { AutocompleteExecutor, ComposedCommandExecute } from '@zekuru-v2/types';
import * as types from '@zekuru-v2/types';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { CommandExecutorBuilder } from './CommandExecutorBuilder';

export class DiscordCommandBuilder extends SlashCommandBuilder {
  private _cooldown?: number;
  private _devOnly?: boolean;
  private _autocompleteExecute?: AutocompleteExecutor;
  private _executorBuilder?: types.CommandExecutorBuilder;

  get cooldown(): number | undefined {
    return this._cooldown;
  }

  setCooldown(cooldown: number): this {
    this._cooldown = cooldown;
    return this;
  }

  get devOnly(): boolean | undefined {
    return this._devOnly;
  }

  setDevOnly(devOnly: boolean): this {
    this._devOnly = devOnly;
    return this;
  }

  get execute(): ComposedCommandExecute | undefined {
    if (!this._executorBuilder) return;
    return this._executorBuilder.execute;
  }

  setExecutors<
    TContext,
    TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction<CacheType>
  >(
    executors: (
      builder: types.CommandExecutorBuilder<TContext, TInteraction>
    ) => types.CommandExecutorBuilder<TContext, TInteraction>
  ): this {
    this._executorBuilder = executors(new CommandExecutorBuilder());
    return this;
  }

  get autocompleteExecute(): AutocompleteExecutor | undefined {
    return this._autocompleteExecute;
  }

  setAutocompleteExecutor(execute: AutocompleteExecutor): this {
    this._autocompleteExecute = execute;
    return this;
  }
}
