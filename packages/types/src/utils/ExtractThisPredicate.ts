/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ExtractThisPredicate<T extends (...args: any[]) => any> =
  // I disabled type checking because the TS compiler hates the way
  // I used 'this' since it's "available only in a non-static member
  // of a class or interface" but I don't care since I need to infer
  // the predicate and without that hack, TypeScript won't infer.
  // @ts-ignore
  T extends (...args: any[]) => this is infer U ? U : never;
