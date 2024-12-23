/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  InteractionErrorExecutor,
  InteractionExecutor,
  InteractionExecutorBinder,
  InteractionExecutorType,
  Next,
} from '@zekuru-v2/types';
import { LastMiddlewareError, MiddlewareError } from '../../middleware';
import { BaseInteraction } from 'discord.js';
import { orderExecutorsByError } from './orderExecutorsByError';
import { isErrorExecutor } from './isErrorExecutor';

const lastErrorExecutor: InteractionErrorExecutor<Error> = async (
  error,
  _context,
  next
) => {
  if (error) {
    throw new LastMiddlewareError(error, error.message);
  }

  await next();
};

export const composeInteractionExecutors = <
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
>(
  executors: readonly InteractionExecutorType<TContext, TInteraction>[]
): InteractionExecutorBinder<TContext, TInteraction> => {
  const middlewares = executors.slice();
  middlewares.push(lastErrorExecutor);

  orderExecutorsByError(middlewares);

  const binder = (context: { interaction: TInteraction } & TContext) => {
    const callbackFn = (
      [composed, handler]: [
        composed: InteractionExecutor,
        handler: InteractionExecutor
      ],
      middleware: InteractionExecutorType
    ) => {
      if (isErrorExecutor(middleware)) {
        const newHandler: InteractionExecutor = async (context, next) => {
          // Must use `.catch()` since for some reason, throwing anything
          // that is NOT an instance of Error throws `UnhandledPromiseRejection`
          await next().catch(async (error) => {
            if (error instanceof LastMiddlewareError) throw error; // Propagate through middlewares
            if (error instanceof Error) {
              await middleware(error, context, handler as Next);
              return;
            }

            throw new MiddlewareError(`Not an instance of Error: ${error}`);
          });
        };

        const boundHandler = newHandler.bind(
          undefined,
          context,
          composed as Next
        );
        return [boundHandler, boundHandler];
      }

      const boundMiddleware = (middleware as InteractionExecutor).bind(
        undefined,
        context,
        composed as Next
      );
      return [boundMiddleware, handler];
    };

    const initialDummy = async () => {};
    const [execute] = middlewares.reduceRight<
      [composed: InteractionExecutor, handler: InteractionExecutor]
    >(callbackFn as any, [initialDummy, initialDummy]);

    return execute as () => Promise<void>;
  };

  return binder;
};
