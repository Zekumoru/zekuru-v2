/* eslint-disable @typescript-eslint/no-empty-object-type */
import mongoose, { Model } from 'mongoose';
import { Channel, ChannelLanguage, ChannelMethods } from '@zekuru-v2/entities';

const ChannelLanguageSchema = new mongoose.Schema<ChannelLanguage>(
  {
    code: {
      type: String,
      required: true,
      lowercase: true,
    },
    variantCode: {
      type: String,
    },
  },
  { _id: false }
);

type ChannelProperties = Omit<Channel, keyof ChannelMethods>;
type ChannelModel = Model<ChannelProperties, {}, ChannelMethods>;

const ChannelSchema = new mongoose.Schema<
  ChannelProperties,
  ChannelModel,
  ChannelMethods
>({
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

export const ChannelModel = mongoose.model<ChannelProperties, ChannelModel>(
  'Channel',
  ChannelSchema
);
