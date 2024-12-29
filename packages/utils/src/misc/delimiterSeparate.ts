export const delimiterSeparate = (
  strings: string[],
  delimiter = ', '
): string => {
  let output = '';

  for (let i = 0; i < strings.length; i++) {
    output += strings[i];
    if (i + 1 !== strings.length) output += delimiter;
  }

  return output;
};
