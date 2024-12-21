/* eslint-disable @typescript-eslint/no-explicit-any */

import { ComposedExecute, Executor } from './Executors';

export interface ExecutorBuilder<TParams extends any[]> {
  get execute(): ComposedExecute<TParams> | undefined;

  add<TArgs extends TParams = TParams>(
    execute: Executor<TArgs>
  ): ExecutorBuilder<TArgs>;
}
