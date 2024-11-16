export const asyncExec = async <T>(
  promise: Promise<T>
): Promise<[T | undefined, unknown]> => {
  try {
    return [await promise, undefined];
  } catch (error) {
    return [undefined, error];
  }
};
