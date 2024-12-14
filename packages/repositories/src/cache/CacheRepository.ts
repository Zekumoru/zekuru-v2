export interface CacheRepository<T> {
  get(key: string): Promise<T | null>;
  set(key: string, data: T): Promise<void>;
}
