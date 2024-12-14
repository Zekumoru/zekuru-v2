import { ClientEvents } from 'discord.js';

type Executor<Event extends keyof ClientEvents> = (
  ...data: ClientEvents[Event]
) => Promise<void> | void;

export class DiscordEventBuilder<Event extends keyof ClientEvents> {
  private _name?: Event;
  private _once?: boolean;
  private _executor?: Executor<Event>;

  get name(): string | undefined {
    return this._name;
  }

  setName<T extends keyof ClientEvents>(name: T): DiscordEventBuilder<T> {
    (this as unknown as DiscordEventBuilder<T>)._name = name;
    return this as unknown as DiscordEventBuilder<T>;
  }

  get once(): boolean | undefined {
    return this._once;
  }

  setOnce(once: boolean): this {
    this._once = once;
    return this;
  }

  get executor(): Executor<Event> | undefined {
    return this._executor;
  }

  setExecutor(executor: Executor<Event>): this {
    this._executor = executor;
    return this;
  }
}
