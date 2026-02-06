/**
 * Error Tracking Utilities
 *
 * Provides error formatting, stack trace handling, and error reporting
 * infrastructure. Designed to integrate with services like Sentry.
 */

// ============================================================================
// Types
// ============================================================================

export interface ErrorContext {
  /** User ID if authenticated */
  userId?: string;
  /** User email if available */
  userEmail?: string;
  /** Current page/route */
  route?: string;
  /** Component name where error occurred */
  component?: string;
  /** Additional tags for categorization */
  tags?: Record<string, string>;
  /** Extra context data */
  extra?: Record<string, unknown>;
  /** Error severity level */
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  /** Fingerprint for grouping similar errors */
  fingerprint?: string[];
}

export interface FormattedError {
  name: string;
  message: string;
  stack?: string;
  cause?: FormattedError;
  context?: ErrorContext;
  timestamp: string;
  id: string;
}

export interface ErrorReporter {
  captureException: (error: Error, context?: ErrorContext) => string;
  captureMessage: (message: string, context?: ErrorContext) => string;
  setUser: (user: { id: string; email?: string; username?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setExtra: (key: string, value: unknown) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
}

export interface Breadcrumb {
  type: "navigation" | "http" | "ui" | "user" | "error" | "debug";
  category: string;
  message: string;
  data?: Record<string, unknown>;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  timestamp?: number;
}

// ============================================================================
// Error ID Generation
// ============================================================================

let errorIdCounter = 0;

/**
 * Generate unique error ID
 */
export function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (++errorIdCounter).toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `err_${timestamp}_${counter}_${random}`;
}

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Format error for logging/reporting
 */
export function formatError(
  error: unknown,
  context?: ErrorContext
): FormattedError {
  const err = normalizeError(error);

  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    cause: err.cause ? formatError(err.cause) : undefined,
    context,
    timestamp: new Date().toISOString(),
    id: generateErrorId(),
  };
}

/**
 * Normalize unknown error to Error object
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (typeof error === "object" && error !== null) {
    const err = new Error(
      (error as { message?: string }).message || "Unknown error"
    );
    err.name = (error as { name?: string }).name || "Error";
    return err;
  }

  return new Error("Unknown error");
}

/**
 * Extract clean stack trace
 */
export function extractStackTrace(error: Error): string[] {
  if (!error.stack) return [];

  return error.stack
    .split("\n")
    .slice(1) // Remove error message line
    .map((line) => line.trim())
    .filter((line) => line.startsWith("at "));
}

/**
 * Parse stack frame
 */
export function parseStackFrame(frame: string): {
  function: string;
  file: string;
  line: number;
  column: number;
} | null {
  // Match: "at functionName (file:line:column)"
  const match = frame.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);

  if (match) {
    return {
      function: match[1]!,
      file: match[2]!,
      line: parseInt(match[3]!, 10),
      column: parseInt(match[4]!, 10),
    };
  }

  // Match: "at file:line:column"
  const simpleMatch = frame.match(/at\s+(.+):(\d+):(\d+)/);

  if (simpleMatch) {
    return {
      function: "<anonymous>",
      file: simpleMatch[1]!,
      line: parseInt(simpleMatch[2]!, 10),
      column: parseInt(simpleMatch[3]!, 10),
    };
  }

  return null;
}

// ============================================================================
// Error Classification
// ============================================================================

export type ErrorCategory =
  | "network"
  | "validation"
  | "authentication"
  | "authorization"
  | "not_found"
  | "rate_limit"
  | "server"
  | "client"
  | "unknown";

/**
 * Classify error by type
 */
export function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (
    name.includes("network") ||
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return "network";
  }

  // Validation errors
  if (
    name.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required")
  ) {
    return "validation";
  }

  // Authentication errors
  if (
    message.includes("unauthorized") ||
    message.includes("unauthenticated") ||
    message.includes("login")
  ) {
    return "authentication";
  }

  // Authorization errors
  if (
    message.includes("forbidden") ||
    message.includes("permission") ||
    message.includes("access denied")
  ) {
    return "authorization";
  }

  // Not found errors
  if (message.includes("not found") || message.includes("404")) {
    return "not_found";
  }

  // Rate limit errors
  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  ) {
    return "rate_limit";
  }

  // Server errors
  if (message.includes("500") || message.includes("server error")) {
    return "server";
  }

  // Client errors
  if (name.includes("type") || name.includes("reference")) {
    return "client";
  }

  return "unknown";
}

// ============================================================================
// Console Error Reporter (Development)
// ============================================================================

/**
 * Console-based error reporter for development
 */
export const consoleReporter: ErrorReporter = {
  captureException(error: Error, context?: ErrorContext): string {
    const formatted = formatError(error, context);

    console.group(`🔴 Error: ${formatted.name}`);
    console.error("Message:", formatted.message);
    console.error("ID:", formatted.id);

    if (formatted.stack) {
      console.error("Stack:", formatted.stack);
    }

    if (context) {
      console.error("Context:", context);
    }

    console.groupEnd();

    return formatted.id;
  },

  captureMessage(message: string, context?: ErrorContext): string {
    const id = generateErrorId();
    const level = context?.level || "info";

    const logFn =
      level === "error" || level === "fatal"
        ? console.error
        : level === "warning"
          ? console.warn
          : console.info;

    logFn(`[${level.toUpperCase()}] ${message}`, { id, context });

    return id;
  },

  setUser(user): void {
    if (user) {
      console.debug("[ErrorTracking] User set:", user.id);
    } else {
      console.debug("[ErrorTracking] User cleared");
    }
  },

  setTag(key: string, value: string): void {
    console.debug(`[ErrorTracking] Tag set: ${key}=${value}`);
  },

  setExtra(key: string, value: unknown): void {
    console.debug(`[ErrorTracking] Extra set: ${key}=`, value);
  },

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    console.debug("[ErrorTracking] Breadcrumb:", breadcrumb);
  },
};

// ============================================================================
// Remote Error Reporter (Production)
// ============================================================================

/**
 * Create remote error reporter
 */
export function createRemoteReporter(config: {
  endpoint: string;
  apiKey?: string;
  environment?: string;
  release?: string;
}): ErrorReporter {
  const { endpoint, apiKey, environment, release } = config;
  const breadcrumbs: Breadcrumb[] = [];
  let currentUser: { id: string; email?: string; username?: string } | null = null;
  const tags: Record<string, string> = {};
  const extras: Record<string, unknown> = {};

  async function sendToEndpoint(payload: Record<string, unknown>): Promise<void> {
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify({
          ...payload,
          environment,
          release,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      });
    } catch (e) {
      console.error("[ErrorTracking] Failed to send error:", e);
    }
  }

  return {
    captureException(error: Error, context?: ErrorContext): string {
      const formatted = formatError(error, context);

      sendToEndpoint({
        type: "exception",
        error: formatted,
        user: currentUser,
        tags: { ...tags, ...context?.tags },
        extra: { ...extras, ...context?.extra },
        breadcrumbs: breadcrumbs.slice(-50), // Last 50 breadcrumbs
      });

      return formatted.id;
    },

    captureMessage(message: string, context?: ErrorContext): string {
      const id = generateErrorId();

      sendToEndpoint({
        type: "message",
        message,
        level: context?.level || "info",
        id,
        user: currentUser,
        tags: { ...tags, ...context?.tags },
        extra: { ...extras, ...context?.extra },
        breadcrumbs: breadcrumbs.slice(-50),
      });

      return id;
    },

    setUser(user): void {
      currentUser = user;
    },

    setTag(key: string, value: string): void {
      tags[key] = value;
    },

    setExtra(key: string, value: unknown): void {
      extras[key] = value;
    },

    addBreadcrumb(breadcrumb: Breadcrumb): void {
      breadcrumbs.push({
        ...breadcrumb,
        timestamp: breadcrumb.timestamp || Date.now(),
      });

      // Keep only last 100 breadcrumbs
      if (breadcrumbs.length > 100) {
        breadcrumbs.shift();
      }
    },
  };
}

// ============================================================================
// Global Error Reporter
// ============================================================================

let globalReporter: ErrorReporter = consoleReporter;

/**
 * Initialize error tracking
 */
export function initErrorTracking(reporter: ErrorReporter): void {
  globalReporter = reporter;
}

/**
 * Get current error reporter
 */
export function getErrorReporter(): ErrorReporter {
  return globalReporter;
}

/**
 * Capture exception
 */
export function captureException(
  error: Error,
  context?: ErrorContext
): string {
  return globalReporter.captureException(error, context);
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  context?: ErrorContext
): string {
  return globalReporter.captureMessage(message, context);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: Breadcrumb): void {
  globalReporter.addBreadcrumb(breadcrumb);
}

// ============================================================================
// Error Boundary Integration
// ============================================================================

/**
 * Create error handler for ErrorBoundary
 */
export function createErrorBoundaryHandler(
  componentName?: string
): (error: Error, errorInfo: { componentStack: string }) => void {
  return (error, errorInfo) => {
    captureException(error, {
      component: componentName,
      extra: {
        componentStack: errorInfo.componentStack,
      },
      tags: {
        errorBoundary: "true",
      },
    });
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(normalizeError(error), context);
      throw error;
    }
  }) as T;
}

/**
 * Safe execution with error tracking
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    captureException(normalizeError(error), context);
    return null;
  }
}
