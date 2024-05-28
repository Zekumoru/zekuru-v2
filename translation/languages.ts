import { appDebug, errorDebug } from '../utilities/logger';
import * as deepl from 'deepl-node';
import gptLanguages from './gpt-4o-2024-05-13-supported-languages.json';
import { Collection } from 'discord.js';

export interface Language {
  name: string;
  code: string;
  deepl?: {
    sourceCode: deepl.SourceLanguageCode;
    targetCode: deepl.TargetLanguageCode;
  };
}

export const languagesMap = new Collection<string, Language>();
export const codeLanguagesMap = new Collection<string, Language>();
gptLanguages.forEach(({ language, code }) => {
  const item = {
    name: language,
    code,
  };
  languagesMap.set(language, item);
  codeLanguagesMap.set(code, item);
});

export const deeplStatus = {
  isLanguagesInitialized: false,
};
export const loadLanguages = async (translator: deepl.Translator) => {
  if (deeplStatus.isLanguagesInitialized) return;

  const [sourceLanguages, targetLanguages] = await Promise.all([
    translator.getSourceLanguages(),
    translator.getTargetLanguages(),
  ]);

  sourceLanguages.forEach((sourceLang) => {
    // find its target counterpart
    const targetLang = targetLanguages.find(
      (targetLang) =>
        targetLang.code === sourceLang.code ||
        (sourceLang.code === 'en' && targetLang.code === 'en-US') ||
        (sourceLang.code === 'pt' && targetLang.code === 'pt-PT')
    );

    // throw an error if a target language isn't found meaning there's
    // source language but its target wasn't accounted for like 'en' and 'pt'
    if (!targetLang) {
      errorDebug(
        `LanguageInitializer: DeepL's source language '${sourceLang.name}' is missing its target language. Check if they updated their languages list.`
      );
      return;
    }

    // add to languages but first check if source has corresponding to it
    const language = languagesMap.get(sourceLang.name);
    const codeLanguage = codeLanguagesMap.get(sourceLang.code);
    if (!language || !codeLanguage) {
      errorDebug(
        `LanguageInitializer: Cannot find the corresponding language for '${sourceLang.name}'.`
      );
      return;
    }

    const deepl = {
      sourceCode: sourceLang.code as unknown as deepl.SourceLanguageCode,
      targetCode: targetLang.code as unknown as deepl.TargetLanguageCode,
    };

    language.deepl = deepl;
    codeLanguage.deepl = deepl;
  });

  deeplStatus.isLanguagesInitialized = true;
  appDebug(`DeepL languages have been initialized!`);
};

export default languagesMap;
