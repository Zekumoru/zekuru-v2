/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  InteractionErrorExecutor,
  InteractionExecutor,
  InteractionExecutorBinder,
  InteractionExecutorType,
  Next,
} from '@zekuru-v2/types';
import { LastMiddlewareError } from '../../middleware';
import { BaseInteraction } from 'discord.js';
import { makeGroups } from './makeGroups';

const lastErrorExecutor: InteractionErrorExecutor<Error> = async (
  error,
  _context, // important to leave these two so that the composer
  _next // knows that they are error executors
) => {
  if (error) {
    throw new LastMiddlewareError(error, error.message);
  }
};

const composeExecutors = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  executors: InteractionExecutor<TContext, TInteraction>[],
  context: TContext & { interaction: TInteraction },
  handler: Next
): (() => Promise<void>) => {
  return executors.reduceRight(
    (composed, executor) => executor.bind(undefined, context, composed as Next),
    handler
  ) as () => Promise<void>;
};

const composeErrorExecutors = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  error: Error,
  executors: InteractionErrorExecutor<Error, TContext, TInteraction>[],
  context: TContext & { interaction: TInteraction },
  handler: Next
): (() => Promise<void>) => {
  return executors.reduceRight(
    (composed, executor) =>
      executor.bind(undefined, error, context, composed as Next),
    handler
  ) as () => Promise<void>;
};

export const composeInteractionExecutors = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  executors: readonly InteractionExecutorType<TContext, TInteraction>[]
): InteractionExecutorBinder<TContext, TInteraction> => {
  const groups = makeGroups([...executors, lastErrorExecutor]);

  const bind = (context: { interaction: TInteraction } & TContext) => {
    const dummy = async () => {};
    const execute = groups.reduceRight<() => Promise<void>>(
      (handler, { executors, errorExecutors }) => {
        const newHandler: InteractionExecutor<TContext, TInteraction> = async (
          context,
          next
        ) => {
          await next().catch(async (error) => {
            if (error instanceof LastMiddlewareError) throw error; // propagate unhandled error
            const errorsComposed = composeErrorExecutors(
              error,
              errorExecutors,
              context,
              handler
            );
            await errorsComposed();
          });
        };

        const composed = composeExecutors(executors, context, handler);
        return newHandler.bind(
          undefined,
          context,
          composed
        ) as () => Promise<void>;
      },
      dummy
    );

    return execute;
  };

  return bind;
};
