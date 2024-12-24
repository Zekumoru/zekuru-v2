/* eslint-disable @typescript-eslint/no-empty-object-type */
import { AutocompleteExecutor } from '@zekuru-v2/types';
import * as types from '@zekuru-v2/types';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { CommandExecutorBuilder } from './executors';

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

  get bindExecutors(): types.InteractionExecutorBinder | undefined {
    if (!this._executorBuilder) return;
    return this._executorBuilder.bind;
  }

  setExecutors<
    TContext extends object = {},
    TError extends Error = Error,
    TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction<CacheType>,
    TBaseContext extends object = TContext
  >(
    executors:
      | types.CommandExecutorBuilder<
          TContext,
          TError,
          TInteraction,
          TBaseContext
        >
      | ((
          builder: types.CommandExecutorBuilder<
            TContext,
            TError,
            TInteraction,
            TBaseContext
          >
        ) => types.CommandExecutorBuilder<
          TContext,
          TError,
          TInteraction,
          TBaseContext
        >)
  ): this {
    if (typeof executors === 'function') {
      this._executorBuilder = executors(new CommandExecutorBuilder());
    } else {
      this._executorBuilder = executors;
    }
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
