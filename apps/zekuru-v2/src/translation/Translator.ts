import TranslatorOptionsMap from './TranslatorOptionsMap';

export type ContentInput = string;
export type TranslatorTypes = keyof TranslatorOptionsMap;

export default interface Translator<TType extends TranslatorTypes> {
  translate(
    content: ContentInput,
    ...args: TranslatorOptionsMap[TType]['single']
  ): Promise<TranslatorOptionsMap[TType]['return']>;

  multitranslate(
    content: ContentInput,
    ...args: TranslatorOptionsMap[TType]['multiple']
  ): Promise<TranslatorOptionsMap[TType]['return'][]>;
}
