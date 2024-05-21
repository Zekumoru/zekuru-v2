import * as deepl from 'deepl-node';
import { Schema, Types, model } from 'mongoose';

interface ITranslateChannelSchema {
  id: string;
  guildId: string;
  sourceLang: deepl.SourceLanguageCode;
  targetLang: deepl.TargetLanguageCode;
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
  sourceLang: {
    type: String,
    required: true,
  },
  targetLang: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('TranslateChannel', TranslateChannelSchema);
