import {
  AutocompleteExecutor,
  ChatInputCommandExecutor,
} from '@zekuru-v2/types';
import { SlashCommandBuilder } from 'discord.js';

export class DiscordCommandBuilder extends SlashCommandBuilder {
  private _cooldown?: number;
  private _devOnly?: boolean;
  private _execute?: ChatInputCommandExecutor;
  private _autocompleteExecute?: AutocompleteExecutor;

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

  get execute(): ChatInputCommandExecutor | undefined {
    return this._execute;
  }

  setExecutor(execute: ChatInputCommandExecutor): this {
    this._execute = execute;
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
