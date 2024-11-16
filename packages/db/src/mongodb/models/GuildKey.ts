import { IGuildKey } from '@zekuru-v2/types';
import { Schema, model } from 'mongoose';

const GuildKeySchema = new Schema<IGuildKey>({
  id: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const GuildKey = model('GuildKey', GuildKeySchema);
