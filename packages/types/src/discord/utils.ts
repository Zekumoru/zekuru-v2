import { ChatInputCommandInteraction } from 'discord.js';
import { ExtractThisPredicate } from '../utils';

export type InGuild<T extends ChatInputCommandInteraction> = T &
  ExtractThisPredicate<ChatInputCommandInteraction['inGuild']>;
