import mongoose from 'mongoose';
import { Channel, ChannelLanguage } from '@zekuru-v2/entities';

const ChannelLanguageSchema = new mongoose.Schema<ChannelLanguage>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    codes: {
      type: [String],
      required: true,
      lowercase: true,
      default: [],
    },
  },
  { _id: false }
);

const ChannelSchema = new mongoose.Schema<Channel>({
  _id: {
    type: String,
    required: true,
    immutable: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  links: {
    type: [String],
    default: [],
  },
  language: {
    type: ChannelLanguageSchema,
    required: true,
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

export default mongoose.model<Channel>('Channel', ChannelSchema);
