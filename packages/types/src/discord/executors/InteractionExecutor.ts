/* eslint-disable @typescript-eslint/no-empty-object-type */
import { BaseInteraction } from 'discord.js';
import { Next } from '../../middleware';

export type InteractionExecutorParams<
  TIsExecutor,
  TContext extends object = {},
  TError extends Error | undefined = undefined,
  TInteraction extends BaseInteraction = BaseInteraction
> = [
  ...(TError extends undefined ? [] : [error: TError]),
  context: { interaction: TInteraction } & TContext,
  ...(TIsExecutor extends true ? [next: Next] : [])
];

export type InteractionExecutor<
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
> = (
  ...args: InteractionExecutorParams<true, TContext, undefined, TInteraction>
) => Promise<void>;

export type InteractionErrorExecutor<
  TError extends Error,
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
> = (
  ...args: InteractionExecutorParams<true, TContext, TError, TInteraction>
) => Promise<void>;

export type InteractionExecutorBinder<
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
> = (
  ...args: InteractionExecutorParams<false, TContext, undefined, TInteraction>
) => () => Promise<void>;

export type InteractionExecutorType<
  TContext extends object = {},
  TInteraction extends BaseInteraction = BaseInteraction
> =
  | InteractionExecutor<TContext, TInteraction>
  | InteractionErrorExecutor<Error, TContext, TInteraction>;
