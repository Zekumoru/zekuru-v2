import {
  AutocompleteExecutor,
  ChatInputCommandExecutor,
} from '@zekuru-v2/types';
import { SlashCommandBuilder } from 'discord.js';

export class DiscordCommandBuilder extends SlashCommandBuilder {
  private _cooldown?: number;
  private _devOnly?: boolean;
  private _executor?: ChatInputCommandExecutor;
  private _autocompleteExecutor?: AutocompleteExecutor;

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

  get executor(): ChatInputCommandExecutor | undefined {
    return this._executor;
  }

  setExecutor(executor: ChatInputCommandExecutor): this {
    this._executor = executor;
    return this;
  }

  get autocompleteExecutor(): AutocompleteExecutor | undefined {
    return this._autocompleteExecutor;
  }

  setAutocompleteExecutor(executor: AutocompleteExecutor): this {
    this._autocompleteExecutor = executor;
    return this;
  }
}
