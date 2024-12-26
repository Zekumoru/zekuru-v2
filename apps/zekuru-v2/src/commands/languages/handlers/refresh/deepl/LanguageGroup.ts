import { LanguageVariant } from '@zekuru-v2/entities';

type LanguageGroup = {
  code: string;
  name: string;
  variants: LanguageVariant[];
};

export default LanguageGroup;
