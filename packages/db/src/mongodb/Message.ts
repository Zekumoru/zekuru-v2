import { Message } from '@zekuru-v2/entities';
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema<Message>({
  _id: {
    type: String,
    required: true,
    immutable: true,
  },
  authorId: {
    type: String,
    required: true,
    immutable: true,
  },
  guildId: {
    type: String,
    required: true,
    immutable: true,
  },
  channelId: {
    type: String,
    required: true,
    immutable: true,
  },
  linkId: {
    type: String,
    required: true,
    immutable: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: Date.now,
  },
});

export const MessageModel = mongoose.model<Message>('Message', MessageSchema);
