export interface SlashCommandBuilderAddon {
  readonly cooldown?: number;
  setCooldown(cooldown: number): this;

  readonly devOnly?: boolean;
  setDevOnly(devOnly: boolean): this;
}
