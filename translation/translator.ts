import * as deepl from 'deepl-node';
import OpenAI from 'openai';
import {
  LanguageError,
  NoTranslatorError,
  TranslationError,
  TranslatorError,
} from './error';
import languagesMap, { Language } from './languages';

export type TranslatorType = 'deepl' | 'openai';

export interface ITranslatorKey {
  type: TranslatorType;
  key: string;
}

export interface ITranslationResult {
  [key: string]: string | undefined;
}

export const deeplTranslatorOptions: deepl.TranslatorOptions = {
  appInfo: {
    appName: 'Zekuru-v2',
    appVersion: '0.9.0',
  },
  minTimeout: 500, // 500 ms
  maxRetries: 10,
};

class Translator {
  #deepl?: deepl.Translator;
  #openai?: OpenAI;
  #keys: ITranslatorKey[];

  constructor(keys: ITranslatorKey[]) {
    this.#keys = keys;
    keys.forEach((key) => {
      switch (key.type) {
        case 'deepl':
          this.#deepl = new deepl.Translator(key.key, deeplTranslatorOptions);
          break;
        case 'openai':
          this.#openai = new OpenAI({
            apiKey: key.key,
          });
          break;
      }
    });
  }

  get keys() {
    return this.#keys;
  }

  get deepl() {
    return this.#deepl;
  }

  get openai() {
    return this.#openai;
  }

  async translate({
    translatorType,
    content,
    contentLanguage,
    targetLanguages,
  }: {
    content: string;
    contentLanguage: Language;
    targetLanguages: Language[];
    translatorType: TranslatorType;
  }) {
    switch (translatorType) {
      case 'deepl':
        return await this.#deeplTranslate(
          content,
          contentLanguage,
          targetLanguages
        );
      case 'openai':
        throw new NoTranslatorError(translatorType);
      default:
        throw new NoTranslatorError(translatorType);
    }
  }

  async #deeplTranslate(
    content: string,
    contentLanguage: Language,
    targetLanguages: Language[]
  ) {
    const deepl = this.#deepl;
    if (!deepl) {
      throw new TranslatorError(
        `There's no DeepL translator. Did you forget to sign-in the bot with DeepL?`
      );
    }

    const sourceDeeplLanguage = contentLanguage.deepl;
    if (!sourceDeeplLanguage) {
      throw new TranslationError(
        `DeepL does not support '${contentLanguage.name}' yet!`
      );
    }

    // start translating each target language
    const results: ITranslationResult = {};

    await Promise.all(
      targetLanguages.map(async (lang) => {
        if (!lang.deepl?.targetCode) return;

        const translatedResult = await deepl.translateText(
          content,
          sourceDeeplLanguage.sourceCode,
          lang.deepl.targetCode
        );

        results[lang.name] = translatedResult.text;
      })
    );

    return results;
  }
}

export default Translator;
