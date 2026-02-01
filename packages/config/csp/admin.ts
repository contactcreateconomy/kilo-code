/**
 * Admin CSP Configuration
 *
 * Content Security Policy for the admin application.
 * Strictest CSP - admin panel requires maximum security.
 */

import type { CspDirectives } from "../security-headers";

/**
 * Admin-specific CSP directives (strictest)
 */
export const adminCsp: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development only
    "https://js.stripe.com", // For refund processing
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.stripe.com",
    "https://res.cloudinary.com",
  ],
  "font-src": [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://api.stripe.com",
    "https://*.convex.cloud",
    "wss://*.convex.cloud",
  ],
  "frame-src": [
    "'self'",
    "https://js.stripe.com",
  ],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": true,
  "block-all-mixed-content": true,
};

/**
 * Production CSP (strictest - no unsafe-eval)
 */
export const adminCspProduction: CspDirectives = {
  ...adminCsp,
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://js.stripe.com",
  ],
};

/**
 * Get admin CSP based on environment
 */
export function getAdminCsp(isDev: boolean = false): CspDirectives {
  return isDev ? adminCsp : adminCspProduction;
}
