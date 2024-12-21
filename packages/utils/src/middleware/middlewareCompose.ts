/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

import { Middleware } from '@zekuru-v2/types';

export const middlewareCompose = <TParams extends any[] = []>(
  middlewares: Middleware<TParams>[]
): ((...args: TParams) => Promise<void>) => {
  return async (...args: TParams) => {
    await middlewares.reduceRight<() => Promise<void>>(
      (composed, middleware) =>
        // I'm using bind to call middlewares one after the next.
        // Now, it might look ugly but it all makes sense:
        // - `undefined` is for the `this` and we don't need it.
        // - `[...args, composed]` spreads the arguments and makes `composed`
        //    or actually `next()` the last argument
        // - `...[...args, composed]` re-spreads to the actual middleware call
        // The double spreading is necessary because we cannot use `push` since
        // we literally need a new array every time for each middleware.
        middleware.bind(undefined, ...[...args, composed]),
      async () => {}
    )();
  };
};
