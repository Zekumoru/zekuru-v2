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

interface DeeplOptions {
  translatorType: 'deepl';
  content: string;
  contentLanguage: Language;
  targetLanguages: Language[];
}

interface OpenAIOptions {
  translatorType: 'openai';
  content: string;
}

type TranslateOptions = DeeplOptions | OpenAIOptions;

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

  async translate(options: TranslateOptions) {
    switch (options.translatorType) {
      case 'deepl':
        return await this.#deeplTranslate(
          options.content,
          options.contentLanguage,
          options.targetLanguages
        );
      case 'openai':
        return await this.#openaiTranslate(options.content);
      default:
        throw new NoTranslatorError(
          (options as { translatorType: string }).translatorType
        );
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

  async #openaiTranslate(content: string) {
    const openai = this.#openai;

    if (!openai) {
      throw new TranslatorError(
        `There's no OpenAI translator. Did you forget to sign-in the bot with OpenAI?`
      );
    }

    console.log(content);

    // start translating
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Translate user's message in JSON format in the form {"Language 1":"Content","Language 2":"Content",...,"Language N":"Content"}. Do not translate tags of <:N:>.`,
        },
        { role: 'user', content },
      ],
    });

    let results: ITranslationResult = {};
    const output = completion.choices[0].message.content;

    if (output) {
      results = JSON.parse(output);
    }

    return results;
  }
}

export default Translator;
