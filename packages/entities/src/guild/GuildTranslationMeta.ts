import { DeepLCredential } from './DeepLCredential';
import { OpenAICredential } from './OpenAICredential';

export type TranslationCredentialMap = {
  deepl: DeepLCredential;
  openai: OpenAICredential;
};

export type TranslationCredential =
  TranslationCredentialMap[keyof TranslationCredentialMap];
export type TranslationCredentialType = TranslationCredential['type'];

export interface GuildTranslationMeta {
  credentials: TranslationCredential[];
}
