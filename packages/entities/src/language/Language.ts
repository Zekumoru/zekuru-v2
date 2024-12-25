/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { CreateDtoUtil, UpdateDtoUtil } from '@zekuru-v2/types';
import { Createable, Modifiable } from '../Common';
import { LanguageVariant } from './LanguageVariant';

export interface LanguageMethods {}

export type LanguageCreateDto = CreateDtoUtil<Language, LanguageMethods>;

export type LanguageUpdateDto = UpdateDtoUtil<LanguageCreateDto>;

export class Language implements Createable, Modifiable, LanguageMethods {
  constructor(
    public _id: string,
    public name: string,
    public variants: LanguageVariant[],
    public supports: string[],
    public createdBy: string,
    public createdAt: Date,
    public modifiedBy: string,
    public modifiedAt: Date
  ) {}
}
