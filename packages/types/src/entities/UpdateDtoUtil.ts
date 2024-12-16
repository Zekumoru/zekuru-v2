/* eslint-disable @typescript-eslint/no-explicit-any */

export type UpdateDtoUtil<T extends Record<string, any>> = Required<
  Pick<T, '_id'>
> &
  Partial<Omit<T, '_id' | 'createdBy'>>;
