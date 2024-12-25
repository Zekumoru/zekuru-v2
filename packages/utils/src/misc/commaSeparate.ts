export const commaSeparate = (strings: string[]): string => {
  let output = '';

  for (let i = 0; i < strings.length; i++) {
    output += strings[i];
    if (i + 1 !== strings.length) output += ', ';
  }

  return output;
};
