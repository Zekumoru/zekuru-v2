/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import { ChatInputCommandInteraction } from 'discord.js';
import { ExecutorBuilder } from './ExecutorBuilder';

export interface CommandExecutorBuilder<
  TContext extends object = {},
  TError extends Error = Error,
  TInteraction extends ChatInputCommandInteraction = ChatInputCommandInteraction,
  TBaseContext extends object = TContext
> extends ExecutorBuilder<TContext, TError, TInteraction, TBaseContext> {}
