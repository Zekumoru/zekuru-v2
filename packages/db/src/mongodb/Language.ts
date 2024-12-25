/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  Language,
  LanguageMethods,
  LanguageVariant,
} from '@zekuru-v2/entities';
import mongoose from 'mongoose';

type LanguageProperties = Omit<Language, keyof LanguageMethods>;
type LanguageModel = mongoose.Model<LanguageProperties, {}, LanguageMethods>;

const LanguageVariantSchema = new mongoose.Schema<LanguageVariant>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const LanguageSchema = new mongoose.Schema<
  LanguageProperties,
  LanguageModel,
  LanguageMethods
>({
  _id: {
    type: String,
    required: true,
    lowercase: true,
    immutable: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  variants: {
    type: [LanguageVariantSchema],
    required: true,
    validate: {
      validator: (variants: LanguageVariant[]) => {
        const codes = variants.map((variant) =>
          variant.code.trim().toLowerCase()
        );
        const names = variants.map((variant) =>
          variant.name.trim().toLowerCase()
        );
        return (
          new Set(codes).size === variants.length &&
          new Set(names).size === variants.length
        );
      },
      message: 'Duplicate language variant codes or names are not allowed.',
    },
    default: [],
  },
  supports: {
    type: [String],
    required: true,
    validate: {
      validator: (supports: string[]) => {
        return new Set(supports).size === supports.length;
      },
      message: 'Duplicate language supports are not allowed.',
    },
    default: [],
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
    required: true,
  },
  modifiedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

LanguageSchema.methods.toString = Language.prototype.toString;

export const LanguageModel = mongoose.model<LanguageProperties, LanguageModel>(
  'Language',
  LanguageSchema
);
