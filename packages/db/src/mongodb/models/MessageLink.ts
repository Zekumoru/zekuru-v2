import { IMessageLink } from '@zekuru-v2/types';
import { Schema, model } from 'mongoose';

const MessageLinkSchema = new Schema<IMessageLink>({
  authorId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    required: true,
  },
  links: [
    {
      messageId: {
        type: String,
        required: true,
      },
      channelId: {
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

export const MessageLink = model('MessageLink', MessageLinkSchema);
