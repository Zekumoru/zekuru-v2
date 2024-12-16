import { CreateDtoUtil, Snowflake, UpdateDtoUtil } from '@zekuru-v2/types';
import {
  GuildTranslationMeta,
  TranslationCredential,
  TranslationCredentialMap,
  TranslationCredentialType,
} from './GuildTranslationMeta';
import { Createable, Modifiable } from '../Common';
import { CommonCredential } from './CommonCredential';

export interface GuildMethods {
  addCredential(
    credential: Omit<
      TranslationCredential,
      keyof Omit<CommonCredential, 'createdBy'>
    >
  ): void;

  removeCredential(apiType: TranslationCredentialType): void;

  findCredential<T extends TranslationCredentialType>(
    apiType: T
  ): TranslationCredentialMap[T] | undefined;
}

export type GuildCreateDto = CreateDtoUtil<Guild, GuildMethods>;

export type GuildUpdateDto = UpdateDtoUtil<GuildCreateDto>;

export class Guild implements Createable, Modifiable, GuildMethods {
  constructor(
    public _id: Snowflake,
    public translation: GuildTranslationMeta,
    public createdAt: Date,
    public createdBy: Snowflake,
    public modifiedAt: Date,
    public modifiedBy: Snowflake
  ) {}

  addCredential(
    credential: Omit<TranslationCredential, keyof CommonCredential>
  ): void {
    this.translation.credentials.push(credential as TranslationCredential);
  }

  removeCredential(apiType: TranslationCredentialType): void {
    this.translation.credentials = this.translation.credentials.filter(
      (credential) => credential.type !== apiType
    );
  }

  findCredential<T extends TranslationCredentialType>(
    apiType: T
  ): TranslationCredentialMap[T] | undefined {
    return this.translation.credentials.find(
      (credential) => credential.type === apiType
    ) as TranslationCredentialMap[T];
  }
}
