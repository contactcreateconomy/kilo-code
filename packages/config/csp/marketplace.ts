/**
 * Marketplace CSP Configuration
 *
 * Content Security Policy for the marketplace application.
 * Allows necessary resources for e-commerce functionality.
 */

import type { CspDirectives } from "../security-headers";

/**
 * Marketplace-specific CSP directives
 */
export const marketplaceCsp: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development
    "https://js.stripe.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for styled-components/emotion
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "https://*.stripe.com",
    "https://images.unsplash.com",
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
    "https://www.google-analytics.com",
    "https://vitals.vercel-insights.com",
  ],
  "frame-src": [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
  ],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": true,
};

/**
 * Production CSP (stricter)
 */
export const marketplaceCspProduction: CspDirectives = {
  ...marketplaceCsp,
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    // Remove unsafe-eval in production
    "https://js.stripe.com",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ],
};

/**
 * Get marketplace CSP based on environment
 */
export function getMarketplaceCsp(isDev: boolean = false): CspDirectives {
  return isDev ? marketplaceCsp : marketplaceCspProduction;
}
