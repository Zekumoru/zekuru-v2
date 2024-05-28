const listToString = (strings: string[]) => {
  const strBuilder: string[] = [];

  for (let i = 0; i < strings.length; i++) {
    strBuilder.push(strings[i]);
    if (i <= strings.length - 3) strBuilder.push(', ');
    else if (i <= strings.length - 2) strBuilder.push(' and ');
  }

  return strBuilder.join('');
};

export default listToString;
