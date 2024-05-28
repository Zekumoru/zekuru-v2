import * as deepl from 'deepl-node';
import OpenAI from 'openai';
import {
  LanguageError,
  NoTranslatorError,
  TranslationError,
  TranslatorError,
} from './error';
import languagesMap, { Language } from './languages';
import { errorDebug } from '../utilities/logger';

export type TranslatorType = 'deepl' | 'openai';

export interface ITranslatorKey {
  type: TranslatorType;
  key: string;
}

export interface ITranslationResult {
  translated: string;
  status: 'success' | 'not-supported';
  sourceLanguage: Language;
  targetLanguage: Language;
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
    contentLangCode,
    targetLangCodes,
  }: {
    content: string;
    contentLangCode: string;
    targetLangCodes: string[];
    translatorType: TranslatorType;
  }) {
    const contentLanguage = languagesMap.find(
      (lang) => lang.code === contentLangCode
    );
    if (!contentLanguage) {
      throw new LanguageError(
        `Source language with code '${contentLangCode}' not found.`
      );
    }

    const targetLanguages = targetLangCodes.map((code) => {
      const language = languagesMap.find((lang) => lang.code === code);
      if (!language) {
        throw new LanguageError(
          `Target language with code '${contentLangCode}' not found.`
        );
      }
      return language;
    });

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
    const results = await Promise.all<ITranslationResult>(
      targetLanguages.map(async (lang) => {
        if (!lang.deepl?.targetCode) {
          return {
            translated: '',
            status: 'not-supported',
            sourceLanguage: contentLanguage,
            targetLanguage: lang,
          };
        }

        const translatedResult = await deepl.translateText(
          content,
          sourceDeeplLanguage.sourceCode,
          lang.deepl.targetCode
        );

        return {
          translated: translatedResult.text,
          status: 'success',
          sourceLanguage: contentLanguage,
          targetLanguage: lang,
        };
      })
    );

    return results;
  }
}

export default Translator;
