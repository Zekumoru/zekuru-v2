import { Schema, Types, model } from 'mongoose';
import { ITranslatorKey, TranslatorType } from '../../translation/translator';

interface IGuildKeySchema {
  id: string;
  preferredTranslator?: TranslatorType;
  keys: ITranslatorKey[];
  createdAt: Date;
}

export interface IGuildKey extends IGuildKeySchema {
  _id: Types.ObjectId;
}

const GuildKeySchema = new Schema<IGuildKey>({
  id: {
    type: String,
    required: true,
  },
  preferredTranslator: {
    type: String,
  },
  keys: [
    {
      type: {
        type: String,
        required: true,
      },
      key: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('GuildKey', GuildKeySchema);
