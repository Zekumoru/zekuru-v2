const originalModule = jest.requireActual('@zekuru-v2/utils');
const mockedLanguages = jest.requireActual('./languages.ts');

export = {
  ...originalModule,
  ...mockedLanguages,
};
