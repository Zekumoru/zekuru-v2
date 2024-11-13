import { Types } from 'mongoose';
import deepl from 'deepl-node';

export interface IGuildKey {
  _id: Types.ObjectId;
  id: string;
  key: string;
  createdAt: Date;
}

export interface ITranslateChannel {
  _id: Types.ObjectId;
  id: string;
  guildId: string;
  sourceLang: deepl.SourceLanguageCode;
  targetLang: deepl.TargetLanguageCode;
  createdAt: Date;
}

export interface IChannelLink {
  _id: Types.ObjectId;
  id: string;
  guildId: string;
  links: ITranslateChannel[];
  createdAt: Date;
}

export interface IMessageLinkItem {
  messageId: string;
  channelId: string;
}

export interface IMessageLink {
  _id: Types.ObjectId;
  authorId: string;
  messageId: string;
  channelId: string;
  links: IMessageLinkItem[];
  createdAt: Date;
}
