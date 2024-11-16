import { Language } from 'deepl-node';

export const targetLanguages: Language[] = [
  {
    name: 'English',
    code: 'en-US',
  },
  {
    name: 'Japanese',
    code: 'ja',
  },
  {
    name: 'Chinese',
    code: 'zh',
  },
  {
    name: 'Korean',
    code: 'ko',
  },
];

export const sourceLanguages: Language[] = [
  {
    name: 'English',
    code: 'en',
  },
  {
    name: 'Japanese',
    code: 'ja',
  },
  {
    name: 'Chinese',
    code: 'zh',
  },
  {
    name: 'Korean',
    code: 'ko',
  },
  {
    // deliberately not create a corresponding target
    // language for testing missing target language
    name: 'English (GB)',
    code: 'en',
  },
];
