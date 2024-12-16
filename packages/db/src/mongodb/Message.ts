/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Message, MessageMethods } from '@zekuru-v2/entities';
import mongoose, { Model } from 'mongoose';

type MessageProperties = Omit<Message, keyof MessageMethods>;
type MessageModel = Model<MessageProperties, {}, MessageMethods>;

const MessageSchema = new mongoose.Schema<
  MessageProperties,
  MessageModel,
  MessageMethods
>({
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

export const MessageModel = mongoose.model<MessageProperties, MessageModel>(
  'Message',
  MessageSchema
);
