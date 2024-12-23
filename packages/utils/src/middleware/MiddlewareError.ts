export class MiddlewareError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'MiddlewareError';
  }
}
