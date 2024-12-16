import * as deepl from 'deepl-node';
import Translator, { ContentInput } from '../Translator';

export default class DeeplTranslator implements Translator<'deepl'> {
  constructor(private translator: deepl.Translator) {}

  translate(
    content: ContentInput,
    sourceLang: deepl.SourceLanguageCode,
    targetLang: deepl.TargetLanguageCode,
    options?: deepl.TranslateTextOptions
  ): Promise<deepl.TextResult> {
    return this.translator.translateText(
      content,
      sourceLang,
      targetLang,
      options
    );
  }

  multitranslate(
    content: ContentInput,
    sourceLang: deepl.SourceLanguageCode,
    targetLangs: deepl.TargetLanguageCode[],
    options?: deepl.TranslateTextOptions
  ): Promise<deepl.TextResult[]> {
    return Promise.all(
      targetLangs.map((targetLang) =>
        this.translate(content, sourceLang, targetLang, options)
      )
    );
  }
}
