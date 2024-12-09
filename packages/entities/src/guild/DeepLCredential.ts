import { CommonCredential } from './CommonCredential';

export interface DeepLCredential extends CommonCredential {
  type: 'deepl';
  apiKey: string;
}
