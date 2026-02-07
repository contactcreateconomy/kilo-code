/**
 * Authentication Configuration for Createconomy
 *
 * This file configures Convex Auth providers.
 * The actual auth providers are configured in auth.ts using convexAuth().
 *
 * Features:
 * - Cross-subdomain session management
 * - Secure cookie configuration
 *
 * @see https://labs.convex.dev/auth
 */

/**
 * Convex Auth configuration
 * This is the required format for @convex-dev/auth
 */
export default {
  providers: [
    {
      domain: process.env["CONVEX_SITE_URL"],
      applicationID: "convex",
    },
  ],
};

/**
 * Allowed origins for cross-subdomain authentication
 * These are the domains that can share session cookies
 */
export const ALLOWED_ORIGINS = [
  // Production domains
  "https://createconomy.com",
  "https://discuss.createconomy.com",
  "https://console.createconomy.com",
  "https://seller.createconomy.com",
  // Development domains
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

/**
 * Cookie configuration for cross-subdomain sessions
 * The leading dot in domain allows sharing across all subdomains
 */
export const COOKIE_CONFIG = {
  /** Cookie domain - leading dot enables subdomain sharing */
  domain: process.env.NODE_ENV === "production" ? ".createconomy.com" : undefined,
  /** Cookie path - root path for all routes */
  path: "/",
  /** Secure flag - HTTPS only in production */
  secure: process.env.NODE_ENV === "production",
  /** SameSite - Lax allows cross-subdomain while preventing CSRF */
  sameSite: "lax" as const,
  /** HttpOnly - prevents JavaScript access (set server-side) */
  httpOnly: true,
  /** Max age in seconds - 7 days */
  maxAge: 7 * 24 * 60 * 60,
};

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  /** Session duration in milliseconds (7 days) */
  maxAge: 7 * 24 * 60 * 60 * 1000,
  /** Session refresh threshold in milliseconds (1 day) */
  refreshThreshold: 24 * 60 * 60 * 1000,
  /** Session update interval in milliseconds (1 hour) */
  updateInterval: 60 * 60 * 1000,
};

/**
 * CORS configuration for cross-subdomain requests
 */
export const CORS_CONFIG = {
  /** Allowed origins for CORS */
  allowedOrigins: ALLOWED_ORIGINS,
  /** Allowed HTTP methods */
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  /** Allowed headers */
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
    "X-Session-Token",
  ],
  /** Exposed headers */
  exposedHeaders: ["X-Session-Token", "X-Session-Expires"],
  /** Allow credentials (cookies) */
  credentials: true,
  /** Preflight cache duration in seconds */
  maxAge: 86400,
};

/**
 * Allowed localhost origins for development mode.
 * Security fix (S7): Instead of allowing any origin with credentials in
 * development, restrict to the specific localhost ports for the four apps:
 *   - :3000 marketplace, :3001 forum, :3002 admin, :3003 seller
 */
const DEV_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

/**
 * Get CORS headers for a request
 * @param origin - The request origin
 * @returns CORS headers object
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};

  // Check if origin is in the production allowed list
  if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (process.env.NODE_ENV === "development") {
    // Security fix (S7): Only allow specific localhost origins in development.
    // Never pair Access-Control-Allow-Credentials: true with wildcard (*).
    if (origin && DEV_ALLOWED_ORIGINS.includes(origin)) {
      headers["Access-Control-Allow-Origin"] = origin;
    }
    // If origin doesn't match any known dev origin, no Allow-Origin header
    // is set, which will cause the browser to block the request.
  }

  headers["Access-Control-Allow-Methods"] = CORS_CONFIG.allowedMethods.join(", ");
  headers["Access-Control-Allow-Headers"] = CORS_CONFIG.allowedHeaders.join(", ");
  headers["Access-Control-Expose-Headers"] = CORS_CONFIG.exposedHeaders.join(", ");
  headers["Access-Control-Allow-Credentials"] = String(CORS_CONFIG.credentials);
  headers["Access-Control-Max-Age"] = String(CORS_CONFIG.maxAge);

  return headers;
}
