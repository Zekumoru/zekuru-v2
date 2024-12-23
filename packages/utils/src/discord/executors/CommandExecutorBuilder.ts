/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  ExecutorBuilder,
  InteractionErrorExecutor,
  InteractionExecutor,
  InteractionExecutorBinder,
  InteractionExecutorType,
} from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';
import { composeInteractionExecutors } from './composeInteractionExecutors';
import * as types from '@zekuru-v2/types';

export class CommandExecutorBuilder<
  TContext extends object = {},
  TError extends Error = Error,
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction,
  TBaseContext extends object = TContext
> implements
    types.CommandExecutorBuilder<TContext, TError, TInteraction, TBaseContext>
{
  private executors?: InteractionExecutorType<TContext, TInteraction>[] = [];

  get bind():
    | InteractionExecutorBinder<TBaseContext, TInteraction>
    | undefined {
    if (!this.executors) return;
    return composeInteractionExecutors(this.executors) as any;
  }

  add<T extends TContext = TContext, U extends TInteraction = TInteraction>(
    execute: InteractionExecutor<T, U>
  ): ExecutorBuilder<T, TError, U, TBaseContext> {
    if (!this.executors) this.executors = [];
    this.executors.push(
      execute as InteractionExecutorType<TContext, TInteraction>
    );
    return this;
  }

  private normalizeErrorExecutor(
    execute: (...args: any[]) => Promise<void>
  ): (...args: any[]) => Promise<void> {
    if (execute.length >= 3) return execute;
    return async (error: any, context: any, next: any) => {
      await execute(error, context, next);
    };
  }

  catch<
    E extends TError = TError,
    T extends TContext = TContext,
    U extends TInteraction = TInteraction
  >(
    execute: InteractionErrorExecutor<E, T, U>
  ): ExecutorBuilder<T, E, U, TBaseContext> {
    return this.add(this.normalizeErrorExecutor(execute));
  }
}
