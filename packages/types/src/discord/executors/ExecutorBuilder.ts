import { BaseInteraction } from 'discord.js';
import {
  InteractionErrorExecutor,
  InteractionExecutor,
  InteractionExecutorBinder,
} from './InteractionExecutor';

export interface ExecutorBuilder<
  TContext extends object,
  TError extends Error,
  TInteraction extends BaseInteraction,
  TBaseContext extends object
> {
  get bind(): InteractionExecutorBinder<TBaseContext, TInteraction> | undefined;

  add<T extends TContext = TContext, U extends TInteraction = TInteraction>(
    execute: InteractionExecutor<T, U>
  ): ExecutorBuilder<T, TError, U, TBaseContext>;

  catch<
    E extends TError = TError,
    T extends TContext = TContext,
    U extends TInteraction = TInteraction
  >(
    execute: InteractionErrorExecutor<E, T, U>
  ): ExecutorBuilder<T, E, U, TBaseContext>;
}
