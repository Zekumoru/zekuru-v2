const parseSupports = (input: string) => {
  return input.split(',').map((token) => token.trim());
};

export default parseSupports;
