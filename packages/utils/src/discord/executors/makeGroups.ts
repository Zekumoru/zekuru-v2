/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  InteractionErrorExecutor,
  InteractionExecutor,
  InteractionExecutorType,
} from '@zekuru-v2/types';
import { BaseInteraction } from 'discord.js';
import { isErrorExecutor } from './isErrorExecutor';

type Group<
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
> = {
  executors: InteractionExecutor<TContext, TInteraction>[];
  errorExecutors: InteractionErrorExecutor<Error, TContext, TInteraction>[];
};

export const makeGroups = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  executors: InteractionExecutorType<TContext, TInteraction>[]
): Group<TContext, TInteraction>[] => {
  const groups: Group<TContext, TInteraction>[] = [
    { executors: [], errorExecutors: [] },
  ];

  for (let i = 0; i < executors.length; i++) {
    const group = groups[groups.length - 1];
    const executor = executors[i];

    if (isErrorExecutor(executor)) {
      group.errorExecutors.push(executor);
    } else {
      group.executors.push(executor);
    }

    if (i + 1 >= executors.length) continue;
    if (!isErrorExecutor(executor)) continue;
    if (isErrorExecutor(executors[i + 1])) continue;

    groups.push({ executors: [], errorExecutors: [] });
  }

  return groups;
};
