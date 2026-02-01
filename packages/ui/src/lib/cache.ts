/**
 * Client-Side Cache Utilities
 *
 * Provides caching strategies for client-side data persistence.
 * Supports LocalStorage, SessionStorage, and in-memory caching with TTL.
 */

// ============================================================================
// Types
// ============================================================================

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Storage type */
  storage?: "local" | "session" | "memory";
  /** Namespace prefix for keys */
  namespace?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_NAMESPACE = "cache";

// ============================================================================
// Memory Cache
// ============================================================================

class MemoryCache {
  private cache: Map<string, CacheItem<unknown>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0 };

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
    this.stats.size = this.cache.size;
  }

  delete(key: string): boolean {
    const result = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return result;
  }

  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private isExpired(item: CacheItem<unknown>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    this.stats.size = this.cache.size;
    return cleaned;
  }
}

// Global memory cache instance
const memoryCache = new MemoryCache();

// ============================================================================
// Storage Cache
// ============================================================================

/**
 * Get storage object
 */
function getStorage(type: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    const storage = type === "local" ? localStorage : sessionStorage;
    // Test if storage is available
    const testKey = "__storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

/**
 * Build cache key with namespace
 */
function buildKey(key: string, namespace: string): string {
  return `${namespace}:${key}`;
}

/**
 * Parse stored cache item
 */
function parseItem<T>(data: string | null): CacheItem<T> | null {
  if (!data) return null;

  try {
    return JSON.parse(data) as CacheItem<T>;
  } catch {
    return null;
  }
}

// ============================================================================
// Cache Functions
// ============================================================================

/**
 * Get item from cache
 */
export function cacheGet<T>(key: string, options: CacheOptions = {}): T | null {
  const { storage = "memory", namespace = DEFAULT_NAMESPACE } = options;
  const fullKey = buildKey(key, namespace);

  if (storage === "memory") {
    return memoryCache.get<T>(fullKey);
  }

  const storageObj = getStorage(storage);
  if (!storageObj) return null;

  const item = parseItem<T>(storageObj.getItem(fullKey));
  if (!item) return null;

  // Check expiration
  if (Date.now() - item.timestamp > item.ttl) {
    storageObj.removeItem(fullKey);
    return null;
  }

  return item.value;
}

/**
 * Set item in cache
 */
export function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): void {
  const {
    ttl = DEFAULT_TTL,
    storage = "memory",
    namespace = DEFAULT_NAMESPACE,
  } = options;
  const fullKey = buildKey(key, namespace);

  if (storage === "memory") {
    memoryCache.set(fullKey, value, ttl);
    return;
  }

  const storageObj = getStorage(storage);
  if (!storageObj) return;

  const item: CacheItem<T> = {
    value,
    timestamp: Date.now(),
    ttl,
  };

  try {
    storageObj.setItem(fullKey, JSON.stringify(item));
  } catch (e) {
    // Storage quota exceeded - try to clean up
    cleanupStorage(storageObj, namespace);
    try {
      storageObj.setItem(fullKey, JSON.stringify(item));
    } catch {
      console.warn("[Cache] Storage quota exceeded");
    }
  }
}

/**
 * Delete item from cache
 */
export function cacheDelete(key: string, options: CacheOptions = {}): boolean {
  const { storage = "memory", namespace = DEFAULT_NAMESPACE } = options;
  const fullKey = buildKey(key, namespace);

  if (storage === "memory") {
    return memoryCache.delete(fullKey);
  }

  const storageObj = getStorage(storage);
  if (!storageObj) return false;

  storageObj.removeItem(fullKey);
  return true;
}

/**
 * Check if item exists in cache
 */
export function cacheHas(key: string, options: CacheOptions = {}): boolean {
  const { storage = "memory", namespace = DEFAULT_NAMESPACE } = options;
  const fullKey = buildKey(key, namespace);

  if (storage === "memory") {
    return memoryCache.has(fullKey);
  }

  const storageObj = getStorage(storage);
  if (!storageObj) return false;

  const item = parseItem(storageObj.getItem(fullKey));
  if (!item) return false;

  if (Date.now() - item.timestamp > item.ttl) {
    storageObj.removeItem(fullKey);
    return false;
  }

  return true;
}

/**
 * Clear all items in namespace
 */
export function cacheClear(options: CacheOptions = {}): void {
  const { storage = "memory", namespace = DEFAULT_NAMESPACE } = options;

  if (storage === "memory") {
    memoryCache.clear();
    return;
  }

  const storageObj = getStorage(storage);
  if (!storageObj) return;

  const prefix = `${namespace}:`;
  const keysToRemove: string[] = [];

  for (let i = 0; i < storageObj.length; i++) {
    const key = storageObj.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storageObj.removeItem(key));
}

/**
 * Clean up expired items from storage
 */
function cleanupStorage(storage: Storage, namespace: string): number {
  const prefix = `${namespace}:`;
  const keysToRemove: string[] = [];
  const now = Date.now();

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(prefix)) {
      const item = parseItem(storage.getItem(key));
      if (item && now - item.timestamp > item.ttl) {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
  return keysToRemove.length;
}

// ============================================================================
// Cache Wrapper
// ============================================================================

/**
 * Create a cached version of an async function
 */
export function withCache<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  options: CacheOptions = {}
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const cached = cacheGet<T>(key, options);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cacheSet(key, result, options);
    return result;
  };
}

/**
 * Create a stale-while-revalidate cached function
 */
export function withSWR<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string,
  options: CacheOptions & { staleTime?: number } = {}
): (...args: Args) => Promise<T> {
  const { staleTime = 60000, ...cacheOptions } = options;
  const revalidating = new Set<string>();

  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);
    const fullKey = buildKey(key, cacheOptions.namespace || DEFAULT_NAMESPACE);

    // Get cached item with metadata
    const storage = cacheOptions.storage || "memory";
    let item: CacheItem<T> | null = null;

    if (storage === "memory") {
      const cached = cacheGet<T>(key, cacheOptions);
      if (cached !== null) {
        // For memory cache, we need to check staleness differently
        item = { value: cached, timestamp: Date.now(), ttl: cacheOptions.ttl || DEFAULT_TTL };
      }
    } else {
      const storageObj = getStorage(storage);
      if (storageObj) {
        item = parseItem<T>(storageObj.getItem(fullKey));
      }
    }

    // If we have a cached value
    if (item) {
      const age = Date.now() - item.timestamp;

      // If stale, revalidate in background
      if (age > staleTime && !revalidating.has(key)) {
        revalidating.add(key);
        fn(...args)
          .then((result) => {
            cacheSet(key, result, cacheOptions);
          })
          .finally(() => {
            revalidating.delete(key);
          });
      }

      // Return cached value immediately
      if (age < item.ttl) {
        return item.value;
      }
    }

    // No cache or expired, fetch fresh
    const result = await fn(...args);
    cacheSet(key, result, cacheOptions);
    return result;
  };
}

// ============================================================================
// Specialized Caches
// ============================================================================

/**
 * Create a cache instance with preset options
 */
export function createCache(defaultOptions: CacheOptions = {}) {
  return {
    get: <T>(key: string, options?: CacheOptions) =>
      cacheGet<T>(key, { ...defaultOptions, ...options }),
    set: <T>(key: string, value: T, options?: CacheOptions) =>
      cacheSet(key, value, { ...defaultOptions, ...options }),
    delete: (key: string, options?: CacheOptions) =>
      cacheDelete(key, { ...defaultOptions, ...options }),
    has: (key: string, options?: CacheOptions) =>
      cacheHas(key, { ...defaultOptions, ...options }),
    clear: (options?: CacheOptions) =>
      cacheClear({ ...defaultOptions, ...options }),
  };
}

/**
 * API response cache (short TTL)
 */
export const apiCache = createCache({
  storage: "memory",
  namespace: "api",
  ttl: 30 * 1000, // 30 seconds
});

/**
 * User preferences cache (long TTL, persistent)
 */
export const preferencesCache = createCache({
  storage: "local",
  namespace: "prefs",
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Session cache (session storage)
 */
export const sessionCache = createCache({
  storage: "session",
  namespace: "session",
  ttl: 60 * 60 * 1000, // 1 hour
});

// ============================================================================
// LRU Cache
// ============================================================================

/**
 * Least Recently Used (LRU) Cache
 */
export class LRUCache<T> {
  private cache: Map<string, T> = new Map();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    // Delete if exists to update position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, value);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

// ============================================================================
// Cache Invalidation
// ============================================================================

/**
 * Cache invalidation patterns
 */
export const cacheInvalidation = {
  /**
   * Invalidate by prefix
   */
  byPrefix: (prefix: string, options: CacheOptions = {}) => {
    const { storage = "memory", namespace = DEFAULT_NAMESPACE } = options;

    if (storage === "memory") {
      // Memory cache doesn't support prefix deletion easily
      // Would need to iterate all keys
      console.warn("[Cache] Prefix invalidation not supported for memory cache");
      return;
    }

    const storageObj = getStorage(storage);
    if (!storageObj) return;

    const fullPrefix = `${namespace}:${prefix}`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < storageObj.length; i++) {
      const key = storageObj.key(i);
      if (key && key.startsWith(fullPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storageObj.removeItem(key));
  },

  /**
   * Invalidate by pattern (regex)
   */
  byPattern: (pattern: RegExp, options: CacheOptions = {}) => {
    const { storage = "memory", namespace = DEFAULT_NAMESPACE } = options;

    if (storage === "memory") {
      console.warn("[Cache] Pattern invalidation not supported for memory cache");
      return;
    }

    const storageObj = getStorage(storage);
    if (!storageObj) return;

    const prefix = `${namespace}:`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < storageObj.length; i++) {
      const key = storageObj.key(i);
      if (key && key.startsWith(prefix)) {
        const keyWithoutPrefix = key.slice(prefix.length);
        if (pattern.test(keyWithoutPrefix)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => storageObj.removeItem(key));
  },

  /**
   * Invalidate all caches
   */
  all: () => {
    memoryCache.clear();
    cacheClear({ storage: "local" });
    cacheClear({ storage: "session" });
  },
};

// ============================================================================
// Exports
// ============================================================================

export { memoryCache };
