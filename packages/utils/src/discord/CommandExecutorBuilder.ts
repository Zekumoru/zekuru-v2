/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatInputCommandInteraction } from 'discord.js';
import { middlewareCompose } from '../middleware';
import {
  CommandExecutor,
  ComposedCommandExecute,
  Executor,
  ExecutorBuilder,
} from '@zekuru-v2/types';

export class CommandExecutorBuilder<
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction,
  TContext = any
> implements ExecutorBuilder<TInteraction, TContext>
{
  private executors?: CommandExecutor<TContext, TInteraction>[] = [];

  get execute(): ComposedCommandExecute<TContext, TInteraction> | undefined {
    if (!this.executors) return;
    return middlewareCompose(this.executors);
  }

  add<T extends TContext = TContext, U extends TInteraction = TInteraction>(
    execute: Executor<U, T>
  ): ExecutorBuilder<U, T> {
    if (!this.executors) this.executors = [];
    this.executors.push(execute);
    return this;
  }
}
