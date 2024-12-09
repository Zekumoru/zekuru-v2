import { DeepLCredential } from './DeepLCredential';
import { OpenAICredential } from './OpenAICredential';

export type TranslationCredential = DeepLCredential | OpenAICredential;

export interface GuildTranslationMeta {
  credentials: TranslationCredential[];
}
