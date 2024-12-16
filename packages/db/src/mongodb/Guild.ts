/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  CommonCredential,
  DeepLCredential,
  Guild,
  GuildMethods,
  GuildTranslationMeta,
  OpenAICredential,
} from '@zekuru-v2/entities';
import mongoose, { Model } from 'mongoose';

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
  { _id: false, discriminatorKey: 'type' }
);

const TranslationSchema = new mongoose.Schema<GuildTranslationMeta>(
  {
    credentials: {
      type: [CredentialSchema],
      required: true,
      default: [],
      validate: {
        validator: (credentials: { type: string }[]) => {
          const types = credentials.map((credential) => credential.type);
          return new Set(types).size === credentials.length;
        },
        message: 'Duplicate api types are not allowed in credentials.',
      },
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
        immutable: true,
        required: true,
      },
    },
    { _id: false }
  )
);

type GuildProperties = Omit<Guild, keyof GuildMethods>;
type GuildModel = Model<GuildProperties, {}, GuildMethods>;

const GuildSchema = new mongoose.Schema<
  GuildProperties,
  GuildModel,
  GuildMethods
>({
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

GuildSchema.methods.addCredential = Guild.prototype.addCredential;
GuildSchema.methods.removeCredential = Guild.prototype.removeCredential;
GuildSchema.methods.findCredential = Guild.prototype.findCredential;

export const GuildModel = mongoose.model<GuildProperties, GuildModel>(
  'Guild',
  GuildSchema
);
