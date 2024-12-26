const parseSupports = (input: string) => {
  const supported = ['openai', 'gemini']; // deepl is ignored
  const tokens = input.split(',').map((token) => token.trim());
  return tokens.filter((token) => supported.includes(token));
};

export default parseSupports;
