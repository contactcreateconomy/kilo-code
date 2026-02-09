/**
 * Error Boundary Component
 *
 * Enhanced error boundary with logging, user-friendly messages,
 * recovery options, and error reporting.
 */

"use client";

import React, { Component, type ReactNode, type ErrorInfo } from "react";

// ============================================================================
// Types
// ============================================================================

export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Error handler callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
  /** Custom error message */
  message?: string;
  /** Whether to allow retry */
  allowRetry?: boolean;
  /** Whether to show report button */
  showReportButton?: boolean;
  /** Report error callback */
  onReport?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================================================
// Error Boundary Component
// ============================================================================

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReport = (): void => {
    const { error, errorInfo } = this.state;
    const { onReport } = this.props;

    if (error && errorInfo && onReport) {
      onReport(error, errorInfo);
    }
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      showDetails = process.env.NODE_ENV === "development",
      message = "Something went wrong",
      allowRetry = true,
      showReportButton = true,
    } = this.props;

    if (hasError && error) {
      // Custom fallback function
      if (typeof fallback === "function") {
        return fallback(error, this.handleReset);
      }

      // Custom fallback element
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          message={message}
          showDetails={showDetails}
          allowRetry={allowRetry}
          showReportButton={showReportButton}
          onReset={this.handleReset}
          onReport={this.handleReport}
        />
      );
    }

    return children;
  }
}

// ============================================================================
// Default Error Fallback
// ============================================================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  message: string;
  showDetails: boolean;
  allowRetry: boolean;
  showReportButton: boolean;
  onReset: () => void;
  onReport: () => void;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  message,
  showDetails,
  allowRetry,
  showReportButton,
  onReset,
  onReport,
}: DefaultErrorFallbackProps): ReactNode {
  return (
    <div
      role="alert"
      style={{
        padding: "24px",
        margin: "16px",
        borderRadius: "8px",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Error Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "12px" }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 600,
            color: "#991b1b",
          }}
        >
          {message}
        </h2>
      </div>

      {/* Error Message */}
      <p
        style={{
          margin: "0 0 16px 0",
          color: "#7f1d1d",
          fontSize: "14px",
        }}
      >
        {error.message || "An unexpected error occurred"}
      </p>

      {/* Action Buttons */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: showDetails ? "16px" : 0,
        }}
      >
        {allowRetry && (
          <button
            onClick={onReset}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        )}
        {showReportButton && (
          <button
            onClick={onReport}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#dc2626",
              border: "1px solid #dc2626",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Report Issue
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 16px",
            backgroundColor: "transparent",
            color: "#6b7280",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reload Page
        </button>
      </div>

      {/* Error Details (Development) */}
      {showDetails && (
        <details
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#fee2e2",
            borderRadius: "6px",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: "#991b1b",
            }}
          >
            Error Details
          </summary>
          <pre
            style={{
              marginTop: "12px",
              padding: "12px",
              backgroundColor: "#1f2937",
              color: "#f9fafb",
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto",
              maxHeight: "300px",
            }}
          >
            <code>
              {error.stack || error.message}
              {errorInfo?.componentStack && (
                <>
                  {"\n\nComponent Stack:"}
                  {errorInfo.componentStack}
                </>
              )}
            </code>
          </pre>
        </details>
      )}
    </div>
  );
}

// ============================================================================
// Specialized Error Boundaries
// ============================================================================

/**
 * Page-level error boundary
 */
export function PageErrorBoundary({
  children,
  ...props
}: Omit<ErrorBoundaryProps, "fallback">): ReactNode {
  return (
    <ErrorBoundary
      {...props}
      fallback={(error, reset) => (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <DefaultErrorFallback
              error={error}
              errorInfo={null}
              message="Page Error"
              showDetails={process.env.NODE_ENV === "development"}
              allowRetry={true}
              showReportButton={true}
              onReset={reset}
              onReport={() => {}}
            />
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Component-level error boundary (minimal UI)
 */
export function ComponentErrorBoundary({
  children,
  componentName = "Component",
  ...props
}: ErrorBoundaryProps & { componentName?: string }): ReactNode {
  return (
    <ErrorBoundary
      {...props}
      fallback={(error, reset) => (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#fef2f2",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "14px" }}>
            {componentName} failed to load
          </p>
          <button
            onClick={reset}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Async boundary for Suspense + Error handling
 */
export function AsyncBoundary({
  children,
  fallback,
  errorFallback,
  onError,
}: {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}): ReactNode {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <React.Suspense fallback={fallback}>{children}</React.Suspense>
    </ErrorBoundary>
  );
}

// ============================================================================
// HOC for Error Boundary
// ============================================================================

/**
 * Higher-order component to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

// ============================================================================
// Error Recovery Hook
// ============================================================================

/**
 * Hook to manually trigger error boundary
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
