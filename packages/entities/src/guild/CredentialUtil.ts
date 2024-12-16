import { CommonCredential } from './CommonCredential';

export type CredentialUtil<T> = Omit<
  T,
  keyof Pick<CommonCredential, 'createdAt'>
>;
