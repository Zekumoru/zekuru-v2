import { Schema, Types, model } from 'mongoose';
import { LanguageCode } from '../../translation/languages';

interface ITranslateChannelSchema {
  id: string;
  guildId: string;
  languageCode: LanguageCode;
  createdAt: Date;
}

export interface ITranslateChannel extends ITranslateChannelSchema {
  _id: Types.ObjectId;
}

const TranslateChannelSchema = new Schema<ITranslateChannelSchema>({
  id: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  languageCode: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('TranslateChannel', TranslateChannelSchema);
