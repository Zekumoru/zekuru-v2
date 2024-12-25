import { CreateDtoUtil, UpdateDtoUtil } from '@zekuru-v2/types';
import { delimiterSeparate } from '@zekuru-v2/utils';
import { Createable, Modifiable } from '../Common';
import { LanguageVariant } from './LanguageVariant';

export interface LanguageMethods {
  toString(): string;
}

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

  toString(): string {
    const variants = delimiterSeparate(
      this.variants.map(
        (variant) => `- \`${variant.code}\`: \`${variant.name}\``
      ),
      '\n'
    );
    const supports = delimiterSeparate(
      this.supports.map((support) => `\`${support}\``)
    );

    return `**Code:** \`${this._id}\`\n**Language:** \`${this.name}\`\n**Supported by APIs:** ${supports}\n**Variants**\n${variants}`;
  }
}
