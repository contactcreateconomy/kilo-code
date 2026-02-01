/**
 * Cross-Subdomain Cookie Management Utilities
 *
 * This module provides utilities for managing cookies across all Createconomy subdomains:
 * - createconomy.com (marketplace)
 * - discuss.createconomy.com (forum)
 * - console.createconomy.com (admin)
 * - seller.createconomy.com (seller)
 *
 * The leading dot in the domain (`.createconomy.com`) enables cookie sharing across subdomains.
 */

/**
 * Cookie configuration for cross-subdomain sessions
 */
export interface CookieOptions {
  /** Cookie domain - leading dot enables subdomain sharing */
  domain?: string;
  /** Cookie path */
  path?: string;
  /** Secure flag - HTTPS only */
  secure?: boolean;
  /** SameSite attribute */
  sameSite?: "strict" | "lax" | "none";
  /** HttpOnly flag - prevents JavaScript access */
  httpOnly?: boolean;
  /** Max age in seconds */
  maxAge?: number;
  /** Expiration date */
  expires?: Date;
}

/**
 * Default cookie options for cross-subdomain authentication
 */
export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  domain: typeof window !== "undefined" && window.location.hostname.includes("createconomy.com")
    ? ".createconomy.com"
    : undefined,
  path: "/",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

/**
 * Cookie names used by the auth system
 */
export const COOKIE_NAMES = {
  SESSION_TOKEN: "__createconomy_session",
  CSRF_TOKEN: "__createconomy_csrf",
  CALLBACK_URL: "__createconomy_callback",
  REDIRECT_URL: "__createconomy_redirect",
} as const;

/**
 * Set a cookie with cross-subdomain support
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === "undefined") {
    console.warn("setCookie called on server side - use server-side cookie handling");
    return;
  }

  const mergedOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (mergedOptions.domain) {
    cookieString += `; Domain=${mergedOptions.domain}`;
  }

  if (mergedOptions.path) {
    cookieString += `; Path=${mergedOptions.path}`;
  }

  if (mergedOptions.maxAge !== undefined) {
    cookieString += `; Max-Age=${mergedOptions.maxAge}`;
  }

  if (mergedOptions.expires) {
    cookieString += `; Expires=${mergedOptions.expires.toUTCString()}`;
  }

  if (mergedOptions.secure) {
    cookieString += "; Secure";
  }

  if (mergedOptions.sameSite) {
    cookieString += `; SameSite=${mergedOptions.sameSite}`;
  }

  // Note: HttpOnly cannot be set from JavaScript - must be set server-side
  // This is intentional for security

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 *
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  const encodedName = encodeURIComponent(name);

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === encodedName) {
      return decodeURIComponent(cookieValue || "");
    }
  }

  return null;
}

/**
 * Delete a cookie
 *
 * @param name - Cookie name
 * @param options - Cookie options (domain and path must match the original cookie)
 */
export function deleteCookie(name: string, options: CookieOptions = {}): void {
  if (typeof document === "undefined") {
    console.warn("deleteCookie called on server side - use server-side cookie handling");
    return;
  }

  const mergedOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };

  // Set cookie with expired date to delete it
  setCookie(name, "", {
    ...mergedOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Check if a cookie exists
 *
 * @param name - Cookie name
 * @returns True if cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Get the session token from cookies
 *
 * @returns Session token or null
 */
export function getSessionToken(): string | null {
  return getCookie(COOKIE_NAMES.SESSION_TOKEN);
}

/**
 * Set the session token cookie
 * Note: For security, the actual session token should be set via HttpOnly cookie from the server
 * This function is for client-side token storage (non-HttpOnly)
 *
 * @param token - Session token
 * @param options - Additional cookie options
 */
export function setSessionToken(token: string, options: CookieOptions = {}): void {
  setCookie(COOKIE_NAMES.SESSION_TOKEN, token, options);
}

/**
 * Clear the session token cookie
 */
export function clearSessionToken(): void {
  deleteCookie(COOKIE_NAMES.SESSION_TOKEN);
}

/**
 * Get the redirect URL from cookies
 *
 * @returns Redirect URL or null
 */
export function getRedirectUrl(): string | null {
  return getCookie(COOKIE_NAMES.REDIRECT_URL);
}

/**
 * Set the redirect URL cookie (for post-login redirect)
 *
 * @param url - URL to redirect to after login
 */
export function setRedirectUrl(url: string): void {
  setCookie(COOKIE_NAMES.REDIRECT_URL, url, {
    maxAge: 60 * 10, // 10 minutes
  });
}

/**
 * Clear the redirect URL cookie
 */
export function clearRedirectUrl(): void {
  deleteCookie(COOKIE_NAMES.REDIRECT_URL);
}

/**
 * Parse cookies from a cookie header string (for server-side use)
 *
 * @param cookieHeader - Cookie header string
 * @returns Object with cookie name-value pairs
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [name, value] = pair.trim().split("=");
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }

  return cookies;
}

/**
 * Serialize cookie options to a string (for server-side Set-Cookie header)
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 * @returns Set-Cookie header value
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const mergedOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (mergedOptions.domain) {
    cookieString += `; Domain=${mergedOptions.domain}`;
  }

  if (mergedOptions.path) {
    cookieString += `; Path=${mergedOptions.path}`;
  }

  if (mergedOptions.maxAge !== undefined) {
    cookieString += `; Max-Age=${mergedOptions.maxAge}`;
  }

  if (mergedOptions.expires) {
    cookieString += `; Expires=${mergedOptions.expires.toUTCString()}`;
  }

  if (mergedOptions.secure) {
    cookieString += "; Secure";
  }

  if (mergedOptions.sameSite) {
    cookieString += `; SameSite=${mergedOptions.sameSite}`;
  }

  if (mergedOptions.httpOnly) {
    cookieString += "; HttpOnly";
  }

  return cookieString;
}

/**
 * Get cookie options for the current environment
 *
 * @param isProduction - Whether running in production
 * @returns Cookie options
 */
export function getCookieOptions(isProduction: boolean = false): CookieOptions {
  return {
    domain: isProduction ? ".createconomy.com" : undefined,
    path: "/",
    secure: isProduction,
    sameSite: "lax",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  };
}

/**
 * Check if we're on a Createconomy subdomain
 *
 * @returns True if on a Createconomy subdomain
 */
export function isCreateconomyDomain(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname;
  return (
    hostname === "createconomy.com" ||
    hostname.endsWith(".createconomy.com") ||
    hostname === "localhost"
  );
}

/**
 * Get the base domain for cookies
 *
 * @returns Cookie domain or undefined for localhost
 */
export function getCookieDomain(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return undefined;
  }

  if (hostname === "createconomy.com" || hostname.endsWith(".createconomy.com")) {
    return ".createconomy.com";
  }

  return undefined;
}
