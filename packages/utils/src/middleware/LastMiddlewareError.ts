import { MiddlewareError } from './MiddlewareError';

export class LastMiddlewareError extends MiddlewareError {
  constructor(public error: Error, message?: string) {
    super(message);
    this.name = 'LastMiddlewareError';
  }
}
