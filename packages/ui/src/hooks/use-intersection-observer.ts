"use client";

/**
 * Intersection Observer Hook
 *
 * Provides lazy loading trigger, infinite scroll support,
 * and visibility tracking for the Createconomy platform.
 */

import { useState, useEffect, useRef, useCallback, type RefObject } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseIntersectionObserverOptions {
  /** Root element for intersection (default: viewport) */
  root?: Element | null;
  /** Margin around root element */
  rootMargin?: string;
  /** Visibility threshold(s) */
  threshold?: number | number[];
  /** Whether to disconnect after first intersection */
  triggerOnce?: boolean;
  /** Whether to start observing immediately */
  enabled?: boolean;
  /** Callback when intersection changes */
  onChange?: (entry: IntersectionObserverEntry) => void;
}

export interface UseIntersectionObserverReturn {
  /** Ref to attach to the target element */
  ref: RefObject<HTMLElement>;
  /** Whether the element is currently intersecting */
  isIntersecting: boolean;
  /** The intersection entry */
  entry: IntersectionObserverEntry | null;
  /** Manually trigger observation */
  observe: () => void;
  /** Manually stop observation */
  unobserve: () => void;
}

export interface UseInViewOptions extends UseIntersectionObserverOptions {
  /** Initial in-view state */
  initialInView?: boolean;
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Intersection Observer Hook
 *
 * @param options - Observer options
 * @returns Observer state and controls
 *
 * @example
 * ```tsx
 * function LazyImage({ src, alt }) {
 *   const { ref, isIntersecting } = useIntersectionObserver({
 *     triggerOnce: true,
 *     rootMargin: '100px',
 *   });
 *
 *   return (
 *     <div ref={ref}>
 *       {isIntersecting ? (
 *         <img src={src} alt={alt} />
 *       ) : (
 *         <div className="placeholder" />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = "0px",
    threshold = 0,
    triggerOnce = false,
    enabled = true,
    onChange,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggered = useRef(false);

  // Cleanup observer
  const cleanup = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Create observer
  const createObserver = useCallback(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    cleanup();

    observerRef.current = new IntersectionObserver(
      ([observerEntry]) => {
        if (!observerEntry) return;

        setEntry(observerEntry);
        setIsIntersecting(observerEntry.isIntersecting);
        onChange?.(observerEntry);

        if (triggerOnce && observerEntry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          cleanup();
        }
      },
      { root, rootMargin, threshold }
    );

    if (ref.current) {
      observerRef.current.observe(ref.current);
    }
  }, [root, rootMargin, threshold, triggerOnce, onChange, cleanup]);

  // Observe function
  const observe = useCallback(() => {
    if (ref.current && observerRef.current) {
      observerRef.current.observe(ref.current);
    } else {
      createObserver();
    }
  }, [createObserver]);

  // Unobserve function
  const unobserve = useCallback(() => {
    if (ref.current && observerRef.current) {
      observerRef.current.unobserve(ref.current);
    }
  }, []);

  // Setup observer
  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    createObserver();

    return cleanup;
  }, [enabled, createObserver, cleanup]);

  // Re-observe when ref changes
  useEffect(() => {
    if (enabled && ref.current && observerRef.current) {
      observerRef.current.observe(ref.current);
    }
  }, [enabled]);

  return {
    ref: ref as RefObject<HTMLElement>,
    isIntersecting,
    entry,
    observe,
    unobserve,
  };
}

// ============================================================================
// Simplified In-View Hook
// ============================================================================

/**
 * Simplified hook for checking if element is in view
 *
 * @param options - Observer options
 * @returns [ref, isInView]
 *
 * @example
 * ```tsx
 * function AnimatedSection() {
 *   const [ref, isInView] = useInView({ triggerOnce: true });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={isInView ? 'animate-in' : 'opacity-0'}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useInView(
  options: UseInViewOptions = {}
): [RefObject<HTMLElement>, boolean] {
  const { initialInView = false, ...observerOptions } = options;
  const { ref, isIntersecting } = useIntersectionObserver(observerOptions);

  return [ref, isIntersecting || initialInView];
}

// ============================================================================
// Infinite Scroll Hook
// ============================================================================

export interface UseInfiniteScrollOptions {
  /** Callback when sentinel is visible */
  onLoadMore: () => void | Promise<void>;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Whether currently loading */
  isLoading?: boolean;
  /** Root margin for early trigger */
  rootMargin?: string;
  /** Threshold for trigger */
  threshold?: number;
  /** Whether infinite scroll is enabled */
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  /** Ref to attach to sentinel element */
  sentinelRef: RefObject<HTMLElement>;
  /** Whether sentinel is visible */
  isVisible: boolean;
}

/**
 * Infinite Scroll Hook
 *
 * @param options - Infinite scroll options
 * @returns Sentinel ref and visibility state
 *
 * @example
 * ```tsx
 * function ProductList() {
 *   const [products, setProducts] = useState([]);
 *   const [hasMore, setHasMore] = useState(true);
 *   const [isLoading, setIsLoading] = useState(false);
 *
 *   const loadMore = async () => {
 *     setIsLoading(true);
 *     const newProducts = await fetchProducts(products.length);
 *     setProducts([...products, ...newProducts]);
 *     setHasMore(newProducts.length > 0);
 *     setIsLoading(false);
 *   };
 *
 *   const { sentinelRef } = useInfiniteScroll({
 *     onLoadMore: loadMore,
 *     hasMore,
 *     isLoading,
 *   });
 *
 *   return (
 *     <div>
 *       {products.map(product => <ProductCard key={product.id} {...product} />)}
 *       <div ref={sentinelRef} />
 *       {isLoading && <Spinner />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions
): UseInfiniteScrollReturn {
  const {
    onLoadMore,
    hasMore,
    isLoading = false,
    rootMargin = "200px",
    threshold = 0,
    enabled = true,
  } = options;

  const loadMoreRef = useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;

  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin,
    threshold,
    enabled: enabled && hasMore && !isLoading,
    onChange: (entry) => {
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMoreRef.current();
      }
    },
  });

  return {
    sentinelRef: ref,
    isVisible: isIntersecting,
  };
}

// ============================================================================
// Visibility Tracking Hook
// ============================================================================

export interface UseVisibilityTrackingOptions {
  /** Callback when element becomes visible */
  onVisible?: (entry: IntersectionObserverEntry) => void;
  /** Callback when element becomes hidden */
  onHidden?: (entry: IntersectionObserverEntry) => void;
  /** Minimum visibility duration before triggering (ms) */
  minVisibleDuration?: number;
  /** Threshold for visibility */
  threshold?: number;
}

export interface UseVisibilityTrackingReturn {
  /** Ref to attach to tracked element */
  ref: RefObject<HTMLElement>;
  /** Whether element is currently visible */
  isVisible: boolean;
  /** Total time visible (ms) */
  visibleTime: number;
  /** Number of times element became visible */
  visibleCount: number;
}

/**
 * Visibility Tracking Hook
 *
 * Track how long and how often an element is visible.
 * Useful for analytics and engagement tracking.
 *
 * @example
 * ```tsx
 * function TrackedAd({ adId }) {
 *   const { ref, visibleTime, visibleCount } = useVisibilityTracking({
 *     onVisible: () => trackAdImpression(adId),
 *     minVisibleDuration: 1000, // 1 second
 *   });
 *
 *   return <div ref={ref}>Ad content</div>;
 * }
 * ```
 */
export function useVisibilityTracking(
  options: UseVisibilityTrackingOptions = {}
): UseVisibilityTrackingReturn {
  const {
    onVisible,
    onHidden,
    minVisibleDuration = 0,
    threshold = 0.5,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [visibleTime, setVisibleTime] = useState(0);
  const [visibleCount, setVisibleCount] = useState(0);

  const visibleStartTime = useRef<number | null>(null);
  const visibleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredVisible = useRef(false);

  const { ref, entry } = useIntersectionObserver({
    threshold,
    onChange: (observerEntry) => {
      if (observerEntry.isIntersecting) {
        visibleStartTime.current = Date.now();
        setIsVisible(true);

        if (minVisibleDuration > 0) {
          visibleTimeoutRef.current = setTimeout(() => {
            if (!hasTriggeredVisible.current) {
              hasTriggeredVisible.current = true;
              setVisibleCount((c) => c + 1);
              onVisible?.(observerEntry);
            }
          }, minVisibleDuration);
        } else {
          setVisibleCount((c) => c + 1);
          onVisible?.(observerEntry);
        }
      } else {
        if (visibleStartTime.current) {
          const duration = Date.now() - visibleStartTime.current;
          setVisibleTime((t) => t + duration);
          visibleStartTime.current = null;
        }

        if (visibleTimeoutRef.current) {
          clearTimeout(visibleTimeoutRef.current);
          visibleTimeoutRef.current = null;
        }

        hasTriggeredVisible.current = false;
        setIsVisible(false);
        onHidden?.(observerEntry);
      }
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (visibleTimeoutRef.current) {
        clearTimeout(visibleTimeoutRef.current);
      }
    };
  }, []);

  return {
    ref,
    isVisible,
    visibleTime,
    visibleCount,
  };
}

// ============================================================================
// Scroll Spy Hook
// ============================================================================

export interface UseScrollSpyOptions {
  /** IDs of sections to track */
  sectionIds: string[];
  /** Offset from top of viewport */
  offset?: number;
  /** Root margin */
  rootMargin?: string;
}

/**
 * Scroll Spy Hook
 *
 * Track which section is currently in view for navigation highlighting.
 *
 * @example
 * ```tsx
 * function TableOfContents() {
 *   const activeSection = useScrollSpy({
 *     sectionIds: ['intro', 'features', 'pricing', 'faq'],
 *     offset: 100,
 *   });
 *
 *   return (
 *     <nav>
 *       {sections.map(section => (
 *         <a
 *           key={section.id}
 *           href={`#${section.id}`}
 *           className={activeSection === section.id ? 'active' : ''}
 *         >
 *           {section.title}
 *         </a>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useScrollSpy(options: UseScrollSpyOptions): string | null {
  const { sectionIds, offset = 0, rootMargin = "0px" } = options;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observers: IntersectionObserver[] = [];
    const visibleSections = new Set<string>();

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            visibleSections.add(id);
          } else {
            visibleSections.delete(id);
          }

          // Set active to first visible section
          const firstVisible = sectionIds.find((sectionId) =>
            visibleSections.has(sectionId)
          );
          setActiveSection(firstVisible || null);
        },
        {
          rootMargin: `${-offset}px 0px 0px 0px`,
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [sectionIds, offset, rootMargin]);

  return activeSection;
}
