/**
 * Security Headers Configuration
 *
 * Centralized security headers for all Createconomy applications.
 * These headers help protect against common web vulnerabilities.
 */

// ============================================================================
// Types
// ============================================================================

export interface SecurityHeadersConfig {
  /** X-DNS-Prefetch-Control */
  dnsPrefetchControl: string;
  /** Strict-Transport-Security */
  strictTransportSecurity: string;
  /** X-Frame-Options */
  frameOptions: string;
  /** X-Content-Type-Options */
  contentTypeOptions: string;
  /** X-XSS-Protection */
  xssProtection: string;
  /** Referrer-Policy */
  referrerPolicy: string;
  /** Permissions-Policy */
  permissionsPolicy: string;
  /** Content-Security-Policy */
  contentSecurityPolicy?: string;
}

export interface NextHeaderConfig {
  key: string;
  value: string;
}

// ============================================================================
// Base Security Headers
// ============================================================================

/**
 * Base security headers applied to all applications
 */
export const baseSecurityHeaders: SecurityHeadersConfig = {
  // Enable DNS prefetching for performance
  dnsPrefetchControl: "on",

  // Enforce HTTPS for 2 years with subdomains and preload
  strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",

  // Prevent clickjacking - allow same origin framing
  frameOptions: "SAMEORIGIN",

  // Prevent MIME type sniffing
  contentTypeOptions: "nosniff",

  // Enable XSS filter in browsers
  xssProtection: "1; mode=block",

  // Control referrer information
  referrerPolicy: "strict-origin-when-cross-origin",

  // Restrict browser features
  permissionsPolicy: [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "payment=(self)",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
  ].join(", "),
};

// ============================================================================
// Content Security Policy Directives
// ============================================================================

export interface CspDirectives {
  "default-src"?: string[];
  "script-src"?: string[];
  "style-src"?: string[];
  "img-src"?: string[];
  "font-src"?: string[];
  "connect-src"?: string[];
  "media-src"?: string[];
  "object-src"?: string[];
  "frame-src"?: string[];
  "frame-ancestors"?: string[];
  "form-action"?: string[];
  "base-uri"?: string[];
  "manifest-src"?: string[];
  "worker-src"?: string[];
  "child-src"?: string[];
  "upgrade-insecure-requests"?: boolean;
  "block-all-mixed-content"?: boolean;
}

/**
 * Build CSP string from directives
 */
export function buildCsp(directives: CspDirectives): string {
  const parts: string[] = [];

  for (const [directive, value] of Object.entries(directives)) {
    if (value === true) {
      parts.push(directive);
    } else if (Array.isArray(value) && value.length > 0) {
      parts.push(`${directive} ${value.join(" ")}`);
    }
  }

  return parts.join("; ");
}

/**
 * Base CSP directives shared across all apps
 */
export const baseCspDirectives: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": ["'self'"],
  "media-src": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'self'"],
  "form-action": ["'self'"],
  "base-uri": ["'self'"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "upgrade-insecure-requests": true,
};

// ============================================================================
// App-Specific CSP Configurations
// ============================================================================

/**
 * Marketplace CSP - allows external images and payment providers
 */
export const marketplaceCspDirectives: CspDirectives = {
  ...baseCspDirectives,
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "*.convex.cloud",
    "images.unsplash.com",
    "avatars.githubusercontent.com",
  ],
  "connect-src": [
    "'self'",
    "*.convex.cloud",
    "*.stripe.com",
    "vitals.vercel-insights.com",
    "va.vercel-scripts.com",
  ],
  "frame-src": ["'self'", "*.stripe.com", "js.stripe.com"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "js.stripe.com",
    "va.vercel-scripts.com",
  ],
};

/**
 * Forum CSP - allows user-generated content with restrictions
 */
export const forumCspDirectives: CspDirectives = {
  ...baseCspDirectives,
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "*.convex.cloud",
    "avatars.githubusercontent.com",
  ],
  "connect-src": [
    "'self'",
    "*.convex.cloud",
    "vitals.vercel-insights.com",
    "va.vercel-scripts.com",
  ],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "va.vercel-scripts.com",
  ],
};

/**
 * Admin CSP - strictest policy
 */
export const adminCspDirectives: CspDirectives = {
  ...baseCspDirectives,
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "*.convex.cloud",
    "avatars.githubusercontent.com",
  ],
  "connect-src": [
    "'self'",
    "*.convex.cloud",
    "*.stripe.com",
    "vitals.vercel-insights.com",
    "va.vercel-scripts.com",
  ],
  "frame-src": ["'self'"],
  "frame-ancestors": ["'none'"], // Prevent framing of admin panel
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "va.vercel-scripts.com",
  ],
};

/**
 * Seller CSP - allows payment and analytics
 */
export const sellerCspDirectives: CspDirectives = {
  ...baseCspDirectives,
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "*.convex.cloud",
    "avatars.githubusercontent.com",
  ],
  "connect-src": [
    "'self'",
    "*.convex.cloud",
    "*.stripe.com",
    "vitals.vercel-insights.com",
    "va.vercel-scripts.com",
  ],
  "frame-src": ["'self'", "*.stripe.com", "connect.stripe.com"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "js.stripe.com",
    "connect.stripe.com",
    "va.vercel-scripts.com",
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert security headers config to Next.js header format
 */
export function toNextHeaders(
  config: SecurityHeadersConfig
): NextHeaderConfig[] {
  const headers: NextHeaderConfig[] = [
    { key: "X-DNS-Prefetch-Control", value: config.dnsPrefetchControl },
    { key: "Strict-Transport-Security", value: config.strictTransportSecurity },
    { key: "X-Frame-Options", value: config.frameOptions },
    { key: "X-Content-Type-Options", value: config.contentTypeOptions },
    { key: "X-XSS-Protection", value: config.xssProtection },
    { key: "Referrer-Policy", value: config.referrerPolicy },
    { key: "Permissions-Policy", value: config.permissionsPolicy },
  ];

  if (config.contentSecurityPolicy) {
    headers.push({
      key: "Content-Security-Policy",
      value: config.contentSecurityPolicy,
    });
  }

  return headers;
}

/**
 * Get security headers for a specific app
 */
export function getSecurityHeaders(
  app: "marketplace" | "forum" | "admin" | "seller"
): NextHeaderConfig[] {
  const cspDirectives = {
    marketplace: marketplaceCspDirectives,
    forum: forumCspDirectives,
    admin: adminCspDirectives,
    seller: sellerCspDirectives,
  }[app];

  const config: SecurityHeadersConfig = {
    ...baseSecurityHeaders,
    contentSecurityPolicy: buildCsp(cspDirectives),
  };

  // Admin has stricter frame options
  if (app === "admin") {
    config.frameOptions = "DENY";
  }

  return toNextHeaders(config);
}

/**
 * Create Next.js headers configuration
 */
export function createHeadersConfig(
  app: "marketplace" | "forum" | "admin" | "seller"
) {
  const headers = getSecurityHeaders(app);

  return async () => [
    {
      source: "/:path*",
      headers,
    },
    // Static assets can have longer cache
    {
      source: "/static/:path*",
      headers: [
        ...headers,
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    // API routes
    {
      source: "/api/:path*",
      headers: [
        ...headers,
        {
          key: "Cache-Control",
          value: "no-store, no-cache, must-revalidate",
        },
      ],
    },
  ];
}

// ============================================================================
// Additional Security Headers
// ============================================================================

/**
 * CORS headers for API routes
 */
export function getCorsHeaders(
  allowedOrigins: string[] = []
): NextHeaderConfig[] {
  return [
    {
      key: "Access-Control-Allow-Origin",
      value: allowedOrigins.length > 0 ? allowedOrigins.join(", ") : "*",
    },
    {
      key: "Access-Control-Allow-Methods",
      value: "GET, POST, PUT, DELETE, OPTIONS",
    },
    {
      key: "Access-Control-Allow-Headers",
      value: "Content-Type, Authorization, X-CSRF-Token",
    },
    {
      key: "Access-Control-Max-Age",
      value: "86400",
    },
  ];
}

/**
 * Cache control headers for different content types
 */
export const cacheHeaders = {
  // No caching for dynamic content
  noCache: {
    key: "Cache-Control",
    value: "no-store, no-cache, must-revalidate, proxy-revalidate",
  },

  // Short cache for frequently updated content
  shortCache: {
    key: "Cache-Control",
    value: "public, max-age=60, stale-while-revalidate=30",
  },

  // Medium cache for semi-static content
  mediumCache: {
    key: "Cache-Control",
    value: "public, max-age=3600, stale-while-revalidate=600",
  },

  // Long cache for static assets
  longCache: {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable",
  },

  // Private cache for user-specific content
  privateCache: {
    key: "Cache-Control",
    value: "private, max-age=300, must-revalidate",
  },
};

// ============================================================================
// Report-Only CSP for Testing
// ============================================================================

/**
 * Generate Report-Only CSP header for testing
 */
export function getReportOnlyCsp(
  directives: CspDirectives,
  reportUri: string
): NextHeaderConfig {
  const csp = buildCsp({
    ...directives,
  });

  return {
    key: "Content-Security-Policy-Report-Only",
    value: `${csp}; report-uri ${reportUri}`,
  };
}
