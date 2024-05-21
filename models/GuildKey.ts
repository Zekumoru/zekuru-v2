import { Schema, Types, model } from 'mongoose';

interface IGuildKeySchema {
  id: string;
  key: string;
  createdAt: Date;
}

export interface IGuildKey extends IGuildKeySchema {
  _id: Types.ObjectId;
}

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

export default model('GuildKey', GuildKeySchema);
