'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
  hasMore: boolean;
  setHasMore: (value: boolean) => void;
}

/**
 * useInfiniteScroll - Hook for implementing infinite scroll functionality
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  
  const ref = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;
    
    setIsLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, enabled, onLoadMore]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, hasMore, isLoading, enabled, handleLoadMore]);

  return {
    ref,
    isLoading,
    hasMore,
    setHasMore,
  };
}
