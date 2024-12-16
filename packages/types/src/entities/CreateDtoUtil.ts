/* eslint-disable @typescript-eslint/no-explicit-any */

export type CreateDtoUtil<
  T extends Record<string, any>,
  U extends Record<string, any>
> = Omit<T, keyof U | 'createdAt' | 'modifiedAt'>;
