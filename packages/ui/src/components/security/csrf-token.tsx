"use client";

/**
 * CSRF Token Component
 *
 * Provides CSRF protection for forms in the Createconomy platform.
 * Generates a token on mount and includes it in forms for validation.
 */

import { useEffect, useState, createContext, use, useCallback, type ReactNode } from "react";
import { generateCsrfToken, getCsrfToken, validateCsrfToken } from "@/lib/security";

// ============================================================================
// Types
// ============================================================================

export interface CsrfContextValue {
  /** Current CSRF token */
  token: string;
  /** Regenerate the CSRF token */
  regenerate: () => void;
  /** Validate a token */
  validate: (token: string) => boolean;
  /** Whether the token is ready */
  isReady: boolean;
}

// ============================================================================
// Context
// ============================================================================

const CsrfContext = createContext<CsrfContextValue | null>(null);

/**
 * Hook to access CSRF token context
 *
 * @returns CSRF context value
 * @throws Error if used outside CsrfProvider
 */
export function useCsrf(): CsrfContextValue {
  const context = use(CsrfContext);
  if (!context) {
    throw new Error("useCsrf must be used within a CsrfProvider");
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

export interface CsrfProviderProps {
  children: ReactNode;
}

/**
 * CSRF Provider Component
 *
 * Provides CSRF token management to child components.
 *
 * @example
 * ```tsx
 * <CsrfProvider>
 *   <App />
 * </CsrfProvider>
 * ```
 */
export function CsrfProvider({ children }: CsrfProviderProps) {
  const [token, setToken] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  // Initialize token on mount
  useEffect(() => {
    const initialToken = getCsrfToken();
    setToken(initialToken);
    setIsReady(true);
  }, []);

  // Regenerate token
  const regenerate = useCallback(() => {
    const newToken = generateCsrfToken();
    setToken(newToken);
  }, []);

  // Validate token
  const validate = useCallback((tokenToValidate: string) => {
    return validateCsrfToken(tokenToValidate);
  }, []);

  const value: CsrfContextValue = {
    token,
    regenerate,
    validate,
    isReady,
  };

  return <CsrfContext.Provider value={value}>{children}</CsrfContext.Provider>;
}

// ============================================================================
// Hidden Input Component
// ============================================================================

export interface CsrfTokenInputProps {
  /** Input name (default: "_csrf") */
  name?: string;
}

/**
 * Hidden CSRF Token Input
 *
 * Renders a hidden input field with the CSRF token.
 * Use this in forms that need CSRF protection.
 *
 * @example
 * ```tsx
 * <form onSubmit={handleSubmit}>
 *   <CsrfTokenInput />
 *   <input type="text" name="email" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
export function CsrfTokenInput({ name = "_csrf" }: CsrfTokenInputProps) {
  const { token, isReady } = useCsrf();

  if (!isReady) {
    return null;
  }

  return <input type="hidden" name={name} value={token} />;
}

// ============================================================================
// Standalone Token Component
// ============================================================================

export interface CsrfTokenProps {
  /** Callback when token is generated */
  onToken?: (token: string) => void;
  /** Input name for form submission */
  name?: string;
  /** Whether to render as hidden input */
  asInput?: boolean;
}

/**
 * Standalone CSRF Token Component
 *
 * Can be used without the CsrfProvider for simpler use cases.
 * Generates its own token on mount.
 *
 * @example
 * ```tsx
 * // As hidden input
 * <form>
 *   <CsrfToken asInput />
 *   ...
 * </form>
 *
 * // With callback
 * <CsrfToken onToken={(token) => setFormToken(token)} />
 * ```
 */
export function CsrfToken({ onToken, name = "_csrf", asInput = false }: CsrfTokenProps) {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const newToken = getCsrfToken();
    setToken(newToken);
    onToken?.(newToken);
  }, [onToken]);

  if (!token) {
    return null;
  }

  if (asInput) {
    return <input type="hidden" name={name} value={token} />;
  }

  return null;
}

// ============================================================================
// Meta Tag Component
// ============================================================================

/**
 * CSRF Meta Tag Component
 *
 * Renders a meta tag with the CSRF token for JavaScript access.
 * Useful for AJAX requests that need to include the token.
 *
 * @example
 * ```tsx
 * // In your layout
 * <head>
 *   <CsrfMetaTag />
 * </head>
 *
 * // In JavaScript
 * const token = document.querySelector('meta[name="csrf-token"]')?.content;
 * ```
 */
export function CsrfMetaTag() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    setToken(getCsrfToken());
  }, []);

  if (!token) {
    return null;
  }

  return <meta name="csrf-token" content={token} />;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get CSRF token from meta tag
 *
 * @returns CSRF token or null if not found
 */
export function getCsrfTokenFromMeta(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") || null;
}

/**
 * Add CSRF token to fetch headers
 *
 * @param headers - Existing headers object
 * @param token - CSRF token (optional, will get from meta if not provided)
 * @returns Headers with CSRF token added
 */
export function addCsrfHeader(
  headers: HeadersInit = {},
  token?: string
): HeadersInit {
  const csrfToken = token || getCsrfTokenFromMeta() || getCsrfToken();

  if (headers instanceof Headers) {
    headers.set("X-CSRF-Token", csrfToken);
    return headers;
  }

  if (Array.isArray(headers)) {
    return [...headers, ["X-CSRF-Token", csrfToken]];
  }

  return {
    ...headers,
    "X-CSRF-Token": csrfToken,
  };
}

/**
 * Create a fetch wrapper with automatic CSRF token inclusion
 *
 * @param baseOptions - Base fetch options
 * @returns Fetch function with CSRF token
 */
export function createCsrfFetch(baseOptions: RequestInit = {}) {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const mergedOptions: RequestInit = {
      ...baseOptions,
      ...options,
      headers: addCsrfHeader({
        ...((baseOptions.headers as Record<string, string>) || {}),
        ...((options.headers as Record<string, string>) || {}),
      }),
    };

    return fetch(url, mergedOptions);
  };
}

// ============================================================================
// Export
// ============================================================================

export { generateCsrfToken, getCsrfToken, validateCsrfToken } from "@/lib/security";
