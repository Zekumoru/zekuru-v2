import { IChannelLink } from '@zekuru-v2/types';
import { Schema, Types, model } from 'mongoose';

const ChannelLinkSchema = new Schema<IChannelLink>({
  id: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  links: [
    {
      type: Types.ObjectId,
      ref: 'TranslateChannel',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ChannelLink = model('ChannelLink', ChannelLinkSchema);
