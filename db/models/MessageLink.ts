import { Schema, Types, model } from 'mongoose';

export interface IMessageLinkItem {
  messageId: string;
  channelId: string;
}

interface IMessageLinkSchema {
  authorId: string;
  messageId: string;
  channelId: string;
  links: IMessageLinkItem[];
  createdAt: Date;
}

export interface IMessageLink extends IMessageLinkSchema {
  _id: Types.ObjectId;
}

const MessageLinkSchema = new Schema<IMessageLinkSchema>({
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

export default model('MessageLink', MessageLinkSchema);
