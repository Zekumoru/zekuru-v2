import { ITranslateChannel } from '@zekuru-v2/types';
import { Schema, model } from 'mongoose';

const TranslateChannelSchema = new Schema<ITranslateChannel>({
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

export const TranslateChannel = model(
  'TranslateChannel',
  TranslateChannelSchema
);
