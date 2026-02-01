/**
 * Client-Side Rate Limiting Utilities
 *
 * Provides request throttling, debounce helpers, and rate limit state management
 * for the Createconomy platform.
 */

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Optional key prefix for storage */
  keyPrefix?: string;
}

export interface RateLimitState {
  /** Number of requests made in current window */
  count: number;
  /** Timestamp when the window resets */
  resetAt: number;
  /** Whether the rate limit has been exceeded */
  isLimited: boolean;
  /** Number of remaining requests */
  remaining: number;
  /** Time until reset in milliseconds */
  retryAfter: number;
}

export interface ThrottleOptions {
  /** Leading edge execution */
  leading?: boolean;
  /** Trailing edge execution */
  trailing?: boolean;
}

// ============================================================================
// Rate Limit Store
// ============================================================================

/**
 * In-memory rate limit store for client-side rate limiting
 */
class RateLimitStore {
  private store: Map<string, { timestamps: number[] }> = new Map();

  /**
   * Record a request for a given key
   */
  record(key: string, windowMs: number): void {
    const now = Date.now();
    const entry = this.store.get(key) || { timestamps: [] };

    // Clean up old timestamps
    entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);
    entry.timestamps.push(now);

    this.store.set(key, entry);
  }

  /**
   * Get the current state for a key
   */
  getState(key: string, config: RateLimitConfig): RateLimitState {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      return {
        count: 0,
        resetAt: now + config.windowMs,
        isLimited: false,
        remaining: config.maxRequests,
        retryAfter: 0,
      };
    }

    // Filter timestamps within the window
    const validTimestamps = entry.timestamps.filter(
      (t) => t > now - config.windowMs
    );
    const count = validTimestamps.length;
    const isLimited = count >= config.maxRequests;
    const oldestTimestamp = validTimestamps[0] || now;
    const resetAt = oldestTimestamp + config.windowMs;

    return {
      count,
      resetAt,
      isLimited,
      remaining: Math.max(0, config.maxRequests - count),
      retryAfter: isLimited ? resetAt - now : 0,
    };
  }

  /**
   * Clear rate limit data for a key
   */
  clear(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  clearAll(): void {
    this.store.clear();
  }
}

// Global rate limit store instance
const rateLimitStore = new RateLimitStore();

// ============================================================================
// Rate Limiter
// ============================================================================

/**
 * Create a rate limiter for a specific action
 *
 * @param config - Rate limit configuration
 * @returns Rate limiter functions
 *
 * @example
 * const searchLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
 *
 * async function handleSearch(query: string) {
 *   const { allowed, state } = searchLimiter.check('search');
 *   if (!allowed) {
 *     console.log(`Rate limited. Retry after ${state.retryAfter}ms`);
 *     return;
 *   }
 *   // Perform search
 * }
 */
export function createRateLimiter(config: RateLimitConfig) {
  const prefix = config.keyPrefix || "rl";

  return {
    /**
     * Check if a request is allowed and record it
     */
    check(key: string): { allowed: boolean; state: RateLimitState } {
      const fullKey = `${prefix}:${key}`;
      const state = rateLimitStore.getState(fullKey, config);

      if (!state.isLimited) {
        rateLimitStore.record(fullKey, config.windowMs);
        return {
          allowed: true,
          state: rateLimitStore.getState(fullKey, config),
        };
      }

      return { allowed: false, state };
    },

    /**
     * Get current state without recording a request
     */
    getState(key: string): RateLimitState {
      return rateLimitStore.getState(`${prefix}:${key}`, config);
    },

    /**
     * Reset rate limit for a key
     */
    reset(key: string): void {
      rateLimitStore.clear(`${prefix}:${key}`);
    },

    /**
     * Reset all rate limits for this limiter
     */
    resetAll(): void {
      rateLimitStore.clearAll();
    },
  };
}

// ============================================================================
// Pre-configured Rate Limiters
// ============================================================================

/**
 * Rate limiter for API requests (100 requests per minute)
 */
export const apiRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000,
  keyPrefix: "api",
});

/**
 * Rate limiter for search requests (30 requests per minute)
 */
export const searchRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000,
  keyPrefix: "search",
});

/**
 * Rate limiter for form submissions (5 requests per minute)
 */
export const formRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60 * 1000,
  keyPrefix: "form",
});

/**
 * Rate limiter for authentication attempts (5 attempts per 15 minutes)
 */
export const authRateLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  keyPrefix: "auth",
});

// ============================================================================
// Throttle Function
// ============================================================================

/**
 * Create a throttled version of a function
 *
 * @param fn - Function to throttle
 * @param wait - Minimum time between invocations in milliseconds
 * @param options - Throttle options
 * @returns Throttled function with cancel method
 *
 * @example
 * const throttledScroll = throttle(handleScroll, 100);
 * window.addEventListener('scroll', throttledScroll);
 *
 * // Later, to cancel pending execution:
 * throttledScroll.cancel();
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: ThrottleOptions = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = true, trailing = true } = options;

  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;
  let result: ReturnType<T>;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = null;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args) as ReturnType<T>;
    return result;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = lastCallTime === null ? wait : time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      timeSinceLastInvoke >= wait
    );
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = lastCallTime === null ? 0 : time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return Math.min(timeWaiting, wait - timeSinceLastInvoke);
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    timerId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return undefined;
  }

  function timerExpired(): void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      trailingEdge(time);
      return;
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : undefined;
  }

  function throttled(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === null) {
        return leadingEdge(time);
      }
      if (trailing) {
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(time);
      }
    }
    if (timerId === null && trailing) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }

  function cancel(): void {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    lastThis = null;
    timerId = null;
  }

  function flush(): ReturnType<T> | undefined {
    if (timerId === null) {
      return result;
    }
    return trailingEdge(Date.now());
  }

  throttled.cancel = cancel;
  throttled.flush = flush;

  return throttled as T & { cancel: () => void; flush: () => void };
}

// ============================================================================
// Debounce Function
// ============================================================================

export interface DebounceOptions {
  /** Execute on the leading edge */
  leading?: boolean;
  /** Execute on the trailing edge */
  trailing?: boolean;
  /** Maximum time to wait before forcing execution */
  maxWait?: number;
}

/**
 * Create a debounced version of a function
 *
 * @param fn - Function to debounce
 * @param wait - Time to wait before invoking in milliseconds
 * @param options - Debounce options
 * @returns Debounced function with cancel and flush methods
 *
 * @example
 * const debouncedSearch = debounce(search, 300);
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 *
 * // Cancel pending execution
 * debouncedSearch.cancel();
 *
 * // Force immediate execution
 * debouncedSearch.flush();
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options: DebounceOptions = {}
): T & { cancel: () => void; flush: () => void; pending: () => boolean } {
  const { leading = false, trailing = true, maxWait } = options;

  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;
  let result: ReturnType<T>;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  let maxTimerId: ReturnType<typeof setTimeout> | null = null;

  const maxing = maxWait !== undefined;
  const maxWaitMs = maxWait ?? 0;

  function invokeFunc(time: number): ReturnType<T> {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = null;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args) as ReturnType<T>;
    return result;
  }

  function startTimer(pendingFunc: () => void, waitTime: number): ReturnType<typeof setTimeout> {
    return setTimeout(pendingFunc, waitTime);
  }

  function cancelTimer(id: ReturnType<typeof setTimeout> | null): void {
    if (id !== null) {
      clearTimeout(id);
    }
  }

  function leadingEdge(time: number): ReturnType<T> | undefined {
    lastInvokeTime = time;
    timerId = startTimer(timerExpired, wait);
    if (maxing) {
      maxTimerId = startTimer(maxDelayExpired, maxWaitMs);
    }
    return leading ? invokeFunc(time) : undefined;
  }

  function remainingWait(time: number): number {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxing
      ? Math.min(timeWaiting, maxWaitMs - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - (lastCallTime ?? 0);
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWaitMs)
    );
  }

  function timerExpired(): void {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function maxDelayExpired(): void {
    const time = Date.now();
    if (lastArgs) {
      invokeFunc(time);
    }
    cancelTimer(timerId);
    timerId = null;
    maxTimerId = null;
  }

  function trailingEdge(time: number): ReturnType<T> | undefined {
    cancelTimer(timerId);
    cancelTimer(maxTimerId);
    timerId = null;
    maxTimerId = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return undefined;
  }

  function cancel(): void {
    cancelTimer(timerId);
    cancelTimer(maxTimerId);
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = undefined;
    lastThis = null;
    timerId = null;
    maxTimerId = null;
  }

  function flush(): ReturnType<T> | undefined {
    if (timerId === null && maxTimerId === null) {
      return result;
    }
    return trailingEdge(Date.now());
  }

  function pending(): boolean {
    return timerId !== null || maxTimerId !== null;
  }

  function debounced(this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === null) {
        return leadingEdge(time);
      }
      if (maxing) {
        cancelTimer(timerId);
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(time);
      }
    }
    if (timerId === null) {
      timerId = startTimer(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced as T & { cancel: () => void; flush: () => void; pending: () => boolean };
}

// ============================================================================
// Request Queue
// ============================================================================

export interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  addedAt: number;
}

/**
 * Request queue for managing concurrent requests
 */
export class RequestQueue {
  private queue: QueuedRequest<unknown>[] = [];
  private processing = 0;
  private maxConcurrent: number;
  private requestDelay: number;
  private lastRequestTime = 0;

  constructor(options: { maxConcurrent?: number; requestDelay?: number } = {}) {
    this.maxConcurrent = options.maxConcurrent ?? 3;
    this.requestDelay = options.requestDelay ?? 0;
  }

  /**
   * Add a request to the queue
   */
  async add<T>(
    execute: () => Promise<T>,
    options: { priority?: number } = {}
  ): Promise<T> {
    const { priority = 0 } = options;

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: Math.random().toString(36).substring(2, 9),
        execute,
        resolve,
        reject,
        priority,
        addedAt: Date.now(),
      };

      // Insert based on priority (higher priority first)
      const insertIndex = this.queue.findIndex((r) => r.priority < priority);
      if (insertIndex === -1) {
        this.queue.push(request as QueuedRequest<unknown>);
      } else {
        this.queue.splice(insertIndex, 0, request as QueuedRequest<unknown>);
      }

      this.processQueue();
    });
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.processing++;

    // Apply request delay if needed
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (this.requestDelay > 0 && timeSinceLastRequest < this.requestDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.requestDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.processing--;
      this.processQueue();
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): { queued: number; processing: number } {
    return {
      queued: this.queue.length,
      processing: this.processing,
    };
  }

  /**
   * Clear the queue
   */
  clear(): void {
    for (const request of this.queue) {
      request.reject(new Error("Queue cleared"));
    }
    this.queue = [];
  }
}

// ============================================================================
// Retry with Backoff
// ============================================================================

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Whether to add jitter to delays */
  jitter?: boolean;
  /** Function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

/**
 * Execute a function with exponential backoff retry
 *
 * @param fn - Function to execute
 * @param options - Retry options
 * @returns Result of the function
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true,
    isRetryable = () => true,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries || !isRetryable(lastError)) {
        throw lastError;
      }

      // Calculate delay with optional jitter
      let actualDelay = Math.min(delay, maxDelay);
      if (jitter) {
        actualDelay = actualDelay * (0.5 + Math.random());
      }

      onRetry?.(attempt + 1, lastError, actualDelay);

      await new Promise((resolve) => setTimeout(resolve, actualDelay));
      delay *= backoffMultiplier;
    }
  }

  throw lastError!;
}
