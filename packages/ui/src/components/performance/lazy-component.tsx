"use client";

/**
 * Lazy Component Wrapper
 *
 * Provides dynamic imports with loading fallback, error boundary,
 * and intersection observer support for lazy loading components.
 */

import {
  Suspense,
  lazy,
  useState,
  useEffect,
  useRef,
  type ComponentType,
  type ReactNode,
  type ErrorInfo,
  Component,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface LazyComponentProps<T extends ComponentType<unknown>> {
  /** Dynamic import function */
  loader: () => Promise<{ default: T }>;
  /** Props to pass to the loaded component */
  componentProps?: React.ComponentProps<T>;
  /** Loading fallback */
  fallback?: ReactNode;
  /** Error fallback */
  errorFallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  /** Whether to load only when visible */
  loadOnVisible?: boolean;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Threshold for intersection observer */
  threshold?: number | number[];
  /** Minimum loading time (prevents flash) */
  minLoadingTime?: number;
  /** Callback when component loads */
  onLoad?: () => void;
  /** Callback when component fails to load */
  onError?: (error: Error) => void;
  /** Container className */
  className?: string;
}

export interface LazyLoadOptions {
  /** Whether to preload the component */
  preload?: boolean;
  /** Retry attempts on failure */
  retryAttempts?: number;
  /** Retry delay in ms */
  retryDelay?: number;
}

// ============================================================================
// Error Boundary
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, retry: () => void) => ReactNode);
  onError?: (error: Error) => void;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class LazyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("LazyComponent Error:", error, errorInfo);
    this.props.onError?.(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === "function") {
        return fallback(this.state.error, this.handleRetry);
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load component
          </p>
          <button
            onClick={this.handleRetry}
            className="text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// Loading Fallbacks
// ============================================================================

/**
 * Default loading skeleton
 */
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted rounded-md",
        className
      )}
    />
  );
}

/**
 * Loading spinner
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

/**
 * Loading dots
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-1 p-4", className)}>
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
    </div>
  );
}

// ============================================================================
// Lazy Component
// ============================================================================

/**
 * Lazy Component Wrapper
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LazyComponent
 *   loader={() => import('./HeavyComponent')}
 *   fallback={<LoadingSkeleton className="h-64" />}
 * />
 *
 * // Load on visible
 * <LazyComponent
 *   loader={() => import('./BelowFoldComponent')}
 *   loadOnVisible
 *   rootMargin="100px"
 * />
 *
 * // With error handling
 * <LazyComponent
 *   loader={() => import('./Component')}
 *   errorFallback={(error, retry) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </div>
 *   )}
 * />
 * ```
 */
export function LazyComponent<T extends ComponentType<unknown>>({
  loader,
  componentProps,
  fallback,
  errorFallback,
  loadOnVisible = false,
  rootMargin = "100px",
  threshold = 0,
  minLoadingTime = 0,
  onLoad,
  onError,
  className,
}: LazyComponentProps<T>) {
  const [shouldLoad, setShouldLoad] = useState(!loadOnVisible);
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer for load on visible
  useEffect(() => {
    if (!loadOnVisible || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loadOnVisible, shouldLoad, rootMargin, threshold]);

  // Create lazy component with retry support
  const LazyLoadedComponent = lazy(async () => {
    const startTime = Date.now();

    try {
      const module = await loader();

      // Ensure minimum loading time
      if (minLoadingTime > 0) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minLoadingTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsed)
          );
        }
      }

      onLoad?.();
      return module;
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  });

  // Handle retry
  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  // Render placeholder if not loading yet
  if (!shouldLoad) {
    return (
      <div ref={containerRef} className={className}>
        {fallback || <LoadingSkeleton className="h-32 w-full" />}
      </div>
    );
  }

  return (
    <div className={className}>
      <LazyErrorBoundary
        key={retryCount}
        fallback={errorFallback}
        onError={onError}
        onRetry={handleRetry}
      >
        <Suspense fallback={fallback || <LoadingSkeleton className="h-32 w-full" />}>
          <LazyLoadedComponent {...(componentProps as object)} />
        </Suspense>
      </LazyErrorBoundary>
    </div>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a lazy component with preloading support
 *
 * @example
 * ```tsx
 * const { Component, preload } = createLazyComponent(
 *   () => import('./HeavyComponent'),
 *   { preload: true }
 * );
 *
 * // Preload on hover
 * <button onMouseEnter={preload}>
 *   Open Modal
 * </button>
 *
 * // Use component
 * <Component />
 * ```
 */
export function createLazyComponent<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): {
  Component: React.LazyExoticComponent<T>;
  preload: () => Promise<{ default: T }>;
} {
  let modulePromise: Promise<{ default: T }> | null = null;

  const load = () => {
    if (!modulePromise) {
      modulePromise = loader();
    }
    return modulePromise;
  };

  // Preload immediately if configured
  if (options.preload) {
    load();
  }

  const LazyComp = lazy(load);

  return {
    Component: LazyComp,
    preload: load,
  };
}

/**
 * Create a lazy component with retry logic
 */
export function createLazyComponentWithRetry<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.LazyExoticComponent<T> {
  const { retryAttempts = 3, retryDelay = 1000 } = options;

  return lazy(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryAttempts; attempt++) {
      try {
        return await loader();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retryAttempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError;
  });
}

// ============================================================================
// Preload Utilities
// ============================================================================

/**
 * Preload a component on idle
 */
export function preloadOnIdle(loader: () => Promise<unknown>): void {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      loader();
    });
  } else {
    setTimeout(loader, 1);
  }
}

/**
 * Preload a component on hover
 */
export function createHoverPreloader(loader: () => Promise<unknown>) {
  let preloaded = false;

  return {
    onMouseEnter: () => {
      if (!preloaded) {
        preloaded = true;
        loader();
      }
    },
  };
}

/**
 * Preload multiple components
 */
export function preloadComponents(
  loaders: Array<() => Promise<unknown>>
): Promise<unknown[]> {
  return Promise.all(loaders.map((loader) => loader()));
}

// ============================================================================
// Route-based Lazy Loading
// ============================================================================

/**
 * Create a lazy page component for Next.js
 *
 * @example
 * ```tsx
 * const LazyDashboard = createLazyPage(
 *   () => import('./pages/Dashboard'),
 *   { fallback: <DashboardSkeleton /> }
 * );
 * ```
 */
export function createLazyPage<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>,
  options: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
  } = {}
) {
  const LazyComp = lazy(loader);

  return function LazyPage(props: React.ComponentProps<T>) {
    return (
      <LazyErrorBoundary fallback={options.errorFallback}>
        <Suspense fallback={options.fallback || <LoadingSkeleton className="min-h-screen" />}>
          <LazyComp {...(props as object)} />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

// ============================================================================
// Exports
// ============================================================================

export { LazyErrorBoundary };
