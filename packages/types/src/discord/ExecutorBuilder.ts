import { ComposedExecute, Executor } from './Executors';

export interface ExecutorBuilder<TInteraction, TContext> {
  get execute(): ComposedExecute<TInteraction, TContext> | undefined;

  add<T extends TContext = TContext, U extends TInteraction = TInteraction>(
    execute: Executor<U, T>
  ): ExecutorBuilder<U, T>;
}
