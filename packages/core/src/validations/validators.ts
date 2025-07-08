export type ValidationResult<T extends object> = T & {
  reasons: string[];
};

export type Validator<T, C = void> = (
  input: T,
  ctx: C,
) => Promise<string | null>;

export async function runValidators<T, C>(
  input: T,
  ctx: C,
  validators: Validator<T, C>[],
): Promise<string[]> {
  const results = await Promise.all(
    validators.map((validator) => validator(input, ctx)),
  );

  return results.filter((r): r is string => r !== null);
}

export function formatValidationResults(results: string[]): string {
  if (results.length === 0) return '';
  if (results.length === 1) return `${results[0]}.`;
  if (results.length === 2) return `${results[0]} and ${results[1]}`;

  const last = results.pop();
  return `${results.join(', ')}, and ${last}`;
}
