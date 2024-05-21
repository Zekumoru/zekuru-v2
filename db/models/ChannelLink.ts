import { Schema, Types, model } from 'mongoose';
import { ITranslateChannel } from './TranslateChannel';

interface IChannelLinkSchema {
  id: string;
  guildId: string;
  links: ITranslateChannel[];
  createdAt: Date;
}

export interface IChannelLink extends IChannelLinkSchema {
  _id: Types.ObjectId;
}

const ChannelLinkSchema = new Schema<IChannelLinkSchema>({
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

export default model('ChannelLink', ChannelLinkSchema);
