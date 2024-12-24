/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  InteractionErrorExecutor,
  InteractionExecutorType,
} from '@zekuru-v2/types';
import { BaseInteraction } from 'discord.js';

export const isErrorExecutor = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  executor: InteractionExecutorType<TContext, TInteraction> | undefined
): executor is InteractionErrorExecutor<Error, TContext, TInteraction> => {
  return !!executor && executor.length >= 3;
};
