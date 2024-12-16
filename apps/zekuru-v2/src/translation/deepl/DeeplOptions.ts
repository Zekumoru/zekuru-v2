import {
  SourceLanguageCode,
  TargetLanguageCode,
  TextResult,
  TranslateTextOptions,
} from 'deepl-node';

export default interface DeeplOptions {
  single: [
    sourceLang: SourceLanguageCode,
    targetLang: TargetLanguageCode,
    options?: TranslateTextOptions
  ];
  multiple: [
    sourceLang: SourceLanguageCode,
    targetLangs: TargetLanguageCode[],
    options?: TranslateTextOptions
  ];
  return: TextResult;
}
