export interface CacheRepository<T> {
  clear(): Promise<void>;
  delete(key: string): Promise<void>;
  get(key: string): Promise<T | null>;
  has(key: string): Promise<boolean>;
  set(key: string, data: T): Promise<void>;
}
