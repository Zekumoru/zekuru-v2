import { LanguageVariant } from '@zekuru-v2/entities';

const VARIANTS_REGEX = /([^,]*):([^,]*),?/gi;

const parseVariants = (input: string) => {
  const matches = input.matchAll(VARIANTS_REGEX);
  const variants: LanguageVariant[] = [];

  for (const match of matches) {
    const code = match[1].trim();
    const name = match[2].trim();
    variants.push({ code, name });
  }

  return variants;
};

export default parseVariants;
