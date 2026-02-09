"use client";

/**
 * Debounce Hook
 *
 * Provides debouncing for search inputs, resize handlers,
 * scroll handlers, and other performance-sensitive operations.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseDebounceOptions {
  /** Delay in milliseconds */
  delay?: number;
  /** Execute on leading edge */
  leading?: boolean;
  /** Execute on trailing edge */
  trailing?: boolean;
  /** Maximum wait time before forced execution */
  maxWait?: number;
}

export interface UseDebouncedCallbackReturn<T extends (...args: unknown[]) => unknown> {
  /** Debounced function */
  callback: (...args: Parameters<T>) => void;
  /** Cancel pending execution */
  cancel: () => void;
  /** Flush pending execution immediately */
  flush: () => void;
  /** Whether there's a pending execution */
  isPending: boolean;
}

// ============================================================================
// useDebounce - Debounce a value
// ============================================================================

/**
 * Debounce a value
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       searchProducts(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// useDebouncedCallback - Debounce a callback function
// ============================================================================

/**
 * Debounce a callback function
 *
 * @param callback - Function to debounce
 * @param options - Debounce options
 * @returns Debounced callback with controls
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const { callback: debouncedSearch, isPending } = useDebouncedCallback(
 *     (query: string) => {
 *       searchProducts(query);
 *     },
 *     { delay: 300 }
 *   );
 *
 *   return (
 *     <div>
 *       <input onChange={(e) => debouncedSearch(e.target.value)} />
 *       {isPending && <span>Searching...</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: UseDebounceOptions = {}
): UseDebouncedCallbackReturn<T> {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait,
  } = options;

  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastInvokeTimeRef = useRef<number>(0);
  const [isPending, setIsPending] = useState(false);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Invoke the callback
  const invokeCallback = useCallback(() => {
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current);
      lastArgsRef.current = null;
      lastInvokeTimeRef.current = Date.now();
    }
    setIsPending(false);
  }, []);

  // Cancel pending execution
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    lastArgsRef.current = null;
    lastCallTimeRef.current = null;
    setIsPending(false);
  }, []);

  // Flush pending execution
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    invokeCallback();
  }, [invokeCallback]);

  // Debounced callback
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const isInvoking = lastCallTimeRef.current === null;

      lastArgsRef.current = args;
      lastCallTimeRef.current = now;

      // Leading edge
      if (leading && isInvoking) {
        invokeCallback();
        return;
      }

      setIsPending(true);

      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set trailing timer
      if (trailing) {
        timerRef.current = setTimeout(() => {
          invokeCallback();
          timerRef.current = null;
          if (maxTimerRef.current) {
            clearTimeout(maxTimerRef.current);
            maxTimerRef.current = null;
          }
        }, delay);
      }

      // Set max wait timer
      if (maxWait !== undefined && !maxTimerRef.current) {
        const timeSinceLastInvoke = now - lastInvokeTimeRef.current;
        const remainingMaxWait = Math.max(0, maxWait - timeSinceLastInvoke);

        maxTimerRef.current = setTimeout(() => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          invokeCallback();
          maxTimerRef.current = null;
        }, remainingMaxWait);
      }
    },
    [delay, leading, trailing, maxWait, invokeCallback]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current);
      }
    };
  }, []);

  return {
    callback: debouncedCallback,
    cancel,
    flush,
    isPending,
  };
}

// ============================================================================
// useThrottle - Throttle a value
// ============================================================================

/**
 * Throttle a value
 *
 * @param value - Value to throttle
 * @param interval - Minimum interval between updates
 * @returns Throttled value
 *
 * @example
 * ```tsx
 * function ScrollTracker() {
 *   const [scrollY, setScrollY] = useState(0);
 *   const throttledScrollY = useThrottle(scrollY, 100);
 *
 *   useEffect(() => {
 *     const handleScroll = () => setScrollY(window.scrollY);
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, []);
 *
 *   return <div>Scroll position: {throttledScrollY}</div>;
 * }
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// ============================================================================
// useThrottledCallback - Throttle a callback function
// ============================================================================

export interface UseThrottledCallbackReturn<T extends (...args: unknown[]) => unknown> {
  /** Throttled function */
  callback: (...args: Parameters<T>) => void;
  /** Cancel pending execution */
  cancel: () => void;
}

/**
 * Throttle a callback function
 *
 * @param callback - Function to throttle
 * @param interval - Minimum interval between executions
 * @param options - Throttle options
 * @returns Throttled callback with controls
 *
 * @example
 * ```tsx
 * function ResizeHandler() {
 *   const { callback: handleResize } = useThrottledCallback(
 *     () => {
 *       console.log('Window resized:', window.innerWidth);
 *     },
 *     100
 *   );
 *
 *   useEffect(() => {
 *     window.addEventListener('resize', handleResize);
 *     return () => window.removeEventListener('resize', handleResize);
 *   }, [handleResize]);
 *
 *   return null;
 * }
 * ```
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  interval: number = 100,
  options: { leading?: boolean; trailing?: boolean } = {}
): UseThrottledCallbackReturn<T> {
  const { leading = true, trailing = true } = options;

  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cancel pending execution
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  // Throttled callback
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      lastArgsRef.current = args;

      if (timeSinceLastCall >= interval) {
        // Enough time has passed, execute immediately
        if (leading) {
          callbackRef.current(...args);
          lastCallTimeRef.current = now;
          lastArgsRef.current = null;
        }
      }

      // Set trailing timer if not already set
      if (trailing && !timerRef.current) {
        const remainingTime = Math.max(0, interval - timeSinceLastCall);

        timerRef.current = setTimeout(() => {
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
            lastCallTimeRef.current = Date.now();
            lastArgsRef.current = null;
          }
          timerRef.current = null;
        }, remainingTime);
      }
    },
    [interval, leading, trailing]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    callback: throttledCallback,
    cancel,
  };
}

// ============================================================================
// useDebouncedState - State with built-in debouncing
// ============================================================================

/**
 * State with built-in debouncing
 *
 * @param initialValue - Initial state value
 * @param delay - Debounce delay
 * @returns [debouncedValue, setValue, immediateValue]
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [debouncedQuery, setQuery, immediateQuery] = useDebouncedState('', 300);
 *
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       searchProducts(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 *
 *   return (
 *     <input
 *       value={immediateQuery}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay);

  return [debouncedValue, setImmediateValue, immediateValue];
}

// ============================================================================
// useDebounceEffect - Debounced useEffect
// ============================================================================

/**
 * Debounced useEffect
 *
 * @param effect - Effect function
 * @param deps - Dependencies
 * @param delay - Debounce delay
 *
 * @example
 * ```tsx
 * function AutoSave({ content }) {
 *   useDebounceEffect(
 *     () => {
 *       saveContent(content);
 *     },
 *     [content],
 *     1000
 *   );
 *
 *   return <Editor content={content} />;
 * }
 * ```
 */
export function useDebounceEffect(
  effect: () => void | (() => void),
  deps: unknown[],
  delay: number = 300
): void {
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useEffect(() => {
    const timer = setTimeout(() => {
      effectRef.current();
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

// ============================================================================
// useAsyncDebounce - Debounce async functions
// ============================================================================

export interface UseAsyncDebounceReturn<T extends (...args: unknown[]) => Promise<unknown>> {
  /** Debounced async function */
  callback: (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined>;
  /** Cancel pending execution */
  cancel: () => void;
  /** Whether currently executing */
  isLoading: boolean;
  /** Last error */
  error: Error | null;
}

/**
 * Debounce async functions with loading and error state
 *
 * @param callback - Async function to debounce
 * @param delay - Debounce delay
 * @returns Debounced async function with state
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const { callback: search, isLoading, error } = useAsyncDebounce(
 *     async (query: string) => {
 *       const results = await searchAPI(query);
 *       return results;
 *     },
 *     300
 *   );
 *
 *   return (
 *     <div>
 *       <input onChange={(e) => search(e.target.value)} />
 *       {isLoading && <Spinner />}
 *       {error && <Error message={error.message} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAsyncDebounce<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T,
  delay: number = 300
): UseAsyncDebounceReturn<T> {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debouncedCallback = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      cancel();
      setError(null);

      return new Promise<Awaited<ReturnType<T>> | undefined>((resolve) => {
        timerRef.current = setTimeout(async () => {
          setIsLoading(true);
          try {
            const result = await callbackRef.current(...args);
            resolve(result as Awaited<ReturnType<T>>);
          } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            resolve(undefined);
          } finally {
            setIsLoading(false);
          }
        }, delay);
      });
    },
    [delay, cancel]
  );

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    callback: debouncedCallback,
    cancel,
    isLoading,
    error,
  };
}
