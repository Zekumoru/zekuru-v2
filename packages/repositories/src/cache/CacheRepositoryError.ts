export class CacheRepositoryError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'CacheRepositoryError';
  }
}
