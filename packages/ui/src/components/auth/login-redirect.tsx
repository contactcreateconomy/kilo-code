"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./auth-provider";
import {
  getRedirectUrl,
  setRedirectUrl,
  clearRedirectUrl,
  getCookieDomain,
} from "../lib/auth-cookies";

/**
 * Props for LoginRedirect component
 */
export interface LoginRedirectProps {
  /** Content to render */
  children: ReactNode;
  /** Default URL to redirect to after login if no stored redirect */
  defaultRedirect?: string;
  /** Whether to automatically redirect after login */
  autoRedirect?: boolean;
  /** Callback when redirect occurs */
  onRedirect?: (url: string) => void;
}

/**
 * LoginRedirect Component
 *
 * Handles storing the intended destination before login and redirecting
 * after successful authentication. Works across subdomains.
 *
 * @example
 * ```tsx
 * // In your app layout
 * <AuthProvider convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}>
 *   <LoginRedirect defaultRedirect="/dashboard">
 *     <YourApp />
 *   </LoginRedirect>
 * </AuthProvider>
 * ```
 */
export function LoginRedirect({
  children,
  defaultRedirect = "/",
  autoRedirect = true,
  onRedirect,
}: LoginRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Handle redirect after login
  useEffect(() => {
    if (isLoading || !isAuthenticated || !autoRedirect) {
      return;
    }

    const redirectUrl = getRedirectUrl();

    if (redirectUrl) {
      clearRedirectUrl();

      // Validate the redirect URL
      if (isValidRedirectUrl(redirectUrl)) {
        onRedirect?.(redirectUrl);

        if (typeof window !== "undefined") {
          window.location.href = redirectUrl;
        }
      } else {
        // Invalid redirect URL, use default
        onRedirect?.(defaultRedirect);

        if (typeof window !== "undefined") {
          window.location.href = defaultRedirect;
        }
      }
    }
  }, [isAuthenticated, isLoading, autoRedirect, defaultRedirect, onRedirect]);

  return <>{children}</>;
}

/**
 * Hook for managing login redirects
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { storeRedirect, getStoredRedirect, redirect } = useLoginRedirect();
 *
 *   // Store current page before redirecting to OAuth
 *   const handleOAuthLogin = () => {
 *     storeRedirect(window.location.href);
 *     window.location.href = '/api/auth/google';
 *   };
 *
 *   // After successful login
 *   const handleLoginSuccess = () => {
 *     redirect('/dashboard'); // Will use stored redirect if available
 *   };
 * }
 * ```
 */
export function useLoginRedirect(defaultRedirect: string = "/") {
  /**
   * Store the current URL for redirect after login
   */
  const storeRedirect = useCallback((url?: string) => {
    const redirectUrl = url || (typeof window !== "undefined" ? window.location.href : "/");
    setRedirectUrl(redirectUrl);
  }, []);

  /**
   * Get the stored redirect URL
   */
  const getStoredRedirect = useCallback((): string | null => {
    return getRedirectUrl();
  }, []);

  /**
   * Clear the stored redirect URL
   */
  const clearStoredRedirect = useCallback(() => {
    clearRedirectUrl();
  }, []);

  /**
   * Redirect to the stored URL or default
   */
  const redirect = useCallback(
    (fallback?: string) => {
      const storedUrl = getRedirectUrl();
      clearRedirectUrl();

      const targetUrl = storedUrl || fallback || defaultRedirect;

      if (isValidRedirectUrl(targetUrl) && typeof window !== "undefined") {
        window.location.href = targetUrl;
      }
    },
    [defaultRedirect]
  );

  /**
   * Store redirect and navigate to login
   */
  const redirectToLogin = useCallback(
    (loginUrl: string = "/auth/signin", currentUrl?: string) => {
      const url = currentUrl || (typeof window !== "undefined" ? window.location.href : "/");
      storeRedirect(url);

      if (typeof window !== "undefined") {
        const loginUrlObj = new URL(loginUrl, window.location.origin);
        loginUrlObj.searchParams.set("redirect", url);
        window.location.href = loginUrlObj.toString();
      }
    },
    [storeRedirect]
  );

  return {
    storeRedirect,
    getStoredRedirect,
    clearStoredRedirect,
    redirect,
    redirectToLogin,
  };
}

/**
 * Validate a redirect URL
 *
 * Ensures the URL is safe to redirect to (same origin or allowed subdomain)
 */
function isValidRedirectUrl(url: string): boolean {
  if (!url) return false;

  // Allow relative URLs
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const urlObj = new URL(url);

    // Check if it's a Createconomy domain
    const hostname = urlObj.hostname;
    if (
      hostname === "createconomy.com" ||
      hostname.endsWith(".createconomy.com") ||
      hostname === "localhost"
    ) {
      return true;
    }

    // In development, allow localhost
    if (
      process.env.NODE_ENV === "development" &&
      (hostname === "localhost" || hostname === "127.0.0.1")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Get redirect URL from query parameters
 */
export function getRedirectFromQuery(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || params.get("returnTo") || params.get("next");

  if (redirect && isValidRedirectUrl(redirect)) {
    return redirect;
  }

  return null;
}

/**
 * Build a login URL with redirect parameter
 */
export function buildLoginUrl(
  loginPath: string = "/auth/signin",
  redirectUrl?: string
): string {
  if (typeof window === "undefined") {
    return loginPath;
  }

  const url = new URL(loginPath, window.location.origin);

  if (redirectUrl) {
    url.searchParams.set("redirect", redirectUrl);
  } else {
    url.searchParams.set("redirect", window.location.href);
  }

  return url.toString();
}

/**
 * Build a cross-subdomain redirect URL
 *
 * Ensures the redirect works across different Createconomy subdomains
 */
export function buildCrossSubdomainRedirect(
  targetSubdomain: "marketplace" | "forum" | "console" | "seller",
  path: string = "/"
): string {
  const subdomainMap = {
    marketplace: "https://createconomy.com",
    forum: "https://discuss.createconomy.com",
    console: "https://console.createconomy.com",
    seller: "https://seller.createconomy.com",
  };

  // In development, use localhost with different ports
  if (process.env.NODE_ENV === "development") {
    const devPorts = {
      marketplace: "3000",
      forum: "3001",
      console: "3002",
      seller: "3003",
    };
    return `http://localhost:${devPorts[targetSubdomain]}${path}`;
  }

  return `${subdomainMap[targetSubdomain]}${path}`;
}

/**
 * Props for RedirectAfterLogin component
 */
export interface RedirectAfterLoginProps {
  /** URL to redirect to */
  to: string;
  /** Delay before redirect in milliseconds */
  delay?: number;
  /** Content to show while redirecting */
  children?: ReactNode;
}

/**
 * RedirectAfterLogin Component
 *
 * Automatically redirects after a successful login.
 * Useful for login success pages.
 *
 * @example
 * ```tsx
 * // In your login success page
 * function LoginSuccessPage() {
 *   return (
 *     <RedirectAfterLogin to="/dashboard" delay={1000}>
 *       <p>Login successful! Redirecting...</p>
 *     </RedirectAfterLogin>
 *   );
 * }
 * ```
 */
export function RedirectAfterLogin({
  to,
  delay = 0,
  children,
}: RedirectAfterLoginProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check for stored redirect first
      const storedRedirect = getRedirectUrl();
      const targetUrl = storedRedirect || to;

      clearRedirectUrl();

      if (isValidRedirectUrl(targetUrl) && typeof window !== "undefined") {
        window.location.href = targetUrl;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [to, delay]);

  return children ? <>{children}</> : null;
}
