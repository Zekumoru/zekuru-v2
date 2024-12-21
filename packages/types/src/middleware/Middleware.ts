/* eslint-disable @typescript-eslint/no-explicit-any */
export type Middleware<TParams extends any[] = []> = (
  ...args: [...TParams, next: () => Promise<void>]
) => Promise<void>;
