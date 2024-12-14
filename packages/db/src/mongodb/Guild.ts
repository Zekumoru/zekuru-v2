import {
  CommonCredential,
  DeepLCredential,
  Guild,
  GuildTranslationMeta,
  OpenAICredential,
} from '@zekuru-v2/entities';
import mongoose from 'mongoose';

const CredentialSchema = new mongoose.Schema<CommonCredential>(
  {
    createdBy: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      immutable: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const TranslationSchema = new mongoose.Schema<GuildTranslationMeta>(
  {
    credentials: {
      type: [CredentialSchema],
      required: true,
      default: [],
    },
  },
  { _id: false }
);

const translationDocArray =
  TranslationSchema.path<mongoose.Schema.Types.DocumentArray>('credentials');

translationDocArray.discriminator(
  'deepl',
  new mongoose.Schema<Omit<DeepLCredential, keyof CommonCredential>>(
    {
      apiKey: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        immutable: true,
        default: 'deepl',
      },
    },
    { _id: false }
  )
);

translationDocArray.discriminator(
  'openai',
  new mongoose.Schema<Omit<OpenAICredential, keyof CommonCredential>>(
    {
      apiKey: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        immutable: true,
        default: 'openai',
      },
    },
    { _id: false }
  )
);

const GuildSchema = new mongoose.Schema<Guild>({
  _id: {
    type: String,
    required: true,
    immutable: true,
  },
  translation: {
    type: TranslationSchema,
    required: true,
    default: {},
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

export default mongoose.model<Guild>('Guild', GuildSchema);
