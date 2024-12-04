import { CommonCredential } from './CommonCredential';

export interface OpenAICredential extends CommonCredential {
  type: 'openai';
  apiKey: string;
}
