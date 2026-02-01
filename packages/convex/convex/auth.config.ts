/**
 * Authentication Configuration for Createconomy
 *
 * This file configures Convex Auth with email/password authentication
 * and OAuth providers (Google, GitHub) for the e-commerce platform.
 *
 * Features:
 * - Email/password authentication
 * - OAuth providers (Google, GitHub)
 * - Cross-subdomain session management
 * - Secure cookie configuration
 *
 * @see https://labs.convex.dev/auth
 */

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
 * Auth configuration object
 *
 * Configure providers by setting environment variables:
 * - AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET for Google OAuth
 * - AUTH_GITHUB_ID, AUTH_GITHUB_SECRET for GitHub OAuth
 * - AUTH_SECRET for session encryption
 */
export default {
  providers: [
    /**
     * Email/Password Provider
     * Allows users to sign up and sign in with email and password
     */
    {
      id: "password",
      type: "credentials",
    },

    /**
     * Google OAuth Provider
     * Configure with AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET env vars
     */
    {
      id: "google",
      type: "oauth",
      // Provider will be configured when env vars are set
    },

    /**
     * GitHub OAuth Provider
     * Configure with AUTH_GITHUB_ID and AUTH_GITHUB_SECRET env vars
     */
    {
      id: "github",
      type: "oauth",
      // Provider will be configured when env vars are set
    },
  ],

  /**
   * Session configuration
   * Supports cross-subdomain authentication
   */
  session: {
    // Session duration in seconds (7 days)
    maxAge: 7 * 24 * 60 * 60,

    // Update session on each request (1 day)
    updateAge: 24 * 60 * 60,
  },

  /**
   * Cookie configuration for cross-subdomain support
   */
  cookies: {
    sessionToken: {
      name: "__createconomy_session",
      options: COOKIE_CONFIG,
    },
    callbackUrl: {
      name: "__createconomy_callback",
      options: {
        ...COOKIE_CONFIG,
        httpOnly: false, // Callback URL needs to be readable client-side
      },
    },
    csrfToken: {
      name: "__createconomy_csrf",
      options: COOKIE_CONFIG,
    },
  },

  /**
   * Callbacks for customizing auth behavior
   */
  callbacks: {
    /**
     * Called when a session is created or updated
     * Use this to add custom data to the session
     */
    session: async ({ session, user }: { session: any; user: any }) => {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.tenantId = user.tenantId;
      }
      return session;
    },

    /**
     * Called when a JWT is created or updated
     * Use this to add custom claims to the token
     */
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },

    /**
     * Called to check if a redirect URL is allowed
     * Ensures redirects only go to allowed origins
     */
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allow URLs from allowed origins
      const urlOrigin = new URL(url).origin;
      if (ALLOWED_ORIGINS.includes(urlOrigin)) {
        return url;
      }

      // Default to base URL
      return baseUrl;
    },
  },

  /**
   * Pages configuration
   * Customize auth-related page URLs
   */
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },

  /**
   * Debug mode
   * Enable in development for detailed logging
   */
  debug: process.env.NODE_ENV === "development",
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
 * Get CORS headers for a request
 * @param origin - The request origin
 * @returns CORS headers object
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};

  // Check if origin is allowed
  if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (process.env.NODE_ENV === "development") {
    // In development, allow localhost origins
    headers["Access-Control-Allow-Origin"] = origin || "*";
  }

  headers["Access-Control-Allow-Methods"] = CORS_CONFIG.allowedMethods.join(", ");
  headers["Access-Control-Allow-Headers"] = CORS_CONFIG.allowedHeaders.join(", ");
  headers["Access-Control-Expose-Headers"] = CORS_CONFIG.exposedHeaders.join(", ");
  headers["Access-Control-Allow-Credentials"] = String(CORS_CONFIG.credentials);
  headers["Access-Control-Max-Age"] = String(CORS_CONFIG.maxAge);

  return headers;
}
