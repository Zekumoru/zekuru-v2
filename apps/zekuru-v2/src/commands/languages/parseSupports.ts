import { apiTypes } from '@zekuru-v2/types';

// deepl is ignored since it's maintained internally
const supported = apiTypes.filter((type) => type !== 'deepl') as string[];

const parseSupports = (input: string) => {
  const tokens = input.split(',').map((token) => token.trim());
  return tokens.filter((token) => supported.includes(token));
};

export default parseSupports;
