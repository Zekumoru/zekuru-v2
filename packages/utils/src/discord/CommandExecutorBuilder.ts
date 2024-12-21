import { ChatInputCommandInteraction } from 'discord.js';
import { middlewareCompose } from '../middleware';
import {
  CommandExecutor,
  ComposedCommandExecute,
  Executor,
  ExecutorBuilder,
} from '@zekuru-v2/types';

export class CommandExecutorBuilder<
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction
> implements ExecutorBuilder<[TInteraction]>
{
  private executors?: CommandExecutor<TInteraction>[] = [];

  get execute(): ComposedCommandExecute<TInteraction> | undefined {
    if (!this.executors) return;
    return middlewareCompose(this.executors);
  }

  add<TArgs extends [TInteraction] = [TInteraction]>(
    execute: Executor<TArgs>
  ): ExecutorBuilder<TArgs> {
    if (!this.executors) this.executors = [];
    this.executors.push(execute);
    return this;
  }
}
