/* eslint-disable @typescript-eslint/no-empty-object-type */
import { InteractionExecutorType } from '@zekuru-v2/types';
import { BaseInteraction } from 'discord.js';
import { isErrorExecutor } from './isErrorExecutor';

export const orderExecutorsByError = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  executors: InteractionExecutorType<TContext, TInteraction>[]
) => {
  let errPos = 0;
  for (let i = 0; i < executors.length; i++) {
    const executor = executors[i];
    if (!isErrorExecutor(executor)) continue;

    // swap by bubbling to the left
    // this is still O(n) by the way because the whole
    // array is traversed twice n + n and not n^2
    for (let j = i; j > errPos; j--) {
      [executors[j], executors[j - 1]] = [executors[j - 1], executors[j]];
    }

    errPos = i + 1;
  }
};
