import * as deepl from 'deepl-node';
import { appDebug } from '../utils/logger';

export const targetLanguages: deepl.Language[] = [];
const loadTargetLanguages = async (translator: deepl.Translator) => {
  targetLanguages.push(
    ...(await translator.getTargetLanguages()).filter(
      (lang) =>
        // push languages without parenthesis like English (American)
        !/\(.*\)/.test(lang.name) ||
        // push languages that are American and European
        lang.name.includes('American') ||
        lang.name.includes('European') ||
        lang.name.includes('simplified')
    )
  );

  appDebug('Target languages loaded.');
};

export const sourceLanguages: deepl.Language[] = [];
const loadSourceLanguages = async (translator: deepl.Translator) => {
  sourceLanguages.push(...(await translator.getSourceLanguages()));
  appDebug('Source languages loaded.');
};

let alreadyCalled = false;
export const loadLanguages = async (translator: deepl.Translator) => {
  if (alreadyCalled) return;
  alreadyCalled = true;

  const targetPromise =
    targetLanguages.length === 0 ? loadTargetLanguages(translator) : undefined;
  const sourcePromise =
    sourceLanguages.length === 0 ? loadSourceLanguages(translator) : undefined;

  // this already accounts if the languages are already loaded
  // I'm referring to undefined promises so need for an if-statement
  await Promise.all([targetPromise, sourcePromise]);
};
