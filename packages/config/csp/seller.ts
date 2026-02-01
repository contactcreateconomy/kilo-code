/**
 * Seller CSP Configuration
 *
 * Content Security Policy for the seller dashboard application.
 * Allows necessary resources for seller management and Stripe Connect.
 */

import type { CspDirectives } from "../security-headers";

/**
 * Seller-specific CSP directives
 */
export const sellerCsp: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development
    "https://js.stripe.com",
    "https://connect-js.stripe.com",
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
    "https://images.unsplash.com",
  ],
  "font-src": [
    "'self'",
    "data:",
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    "https://api.stripe.com",
    "https://uploads.stripe.com",
    "https://*.convex.cloud",
    "wss://*.convex.cloud",
    "https://vitals.vercel-insights.com",
  ],
  "frame-src": [
    "'self'",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://connect-js.stripe.com",
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
export const sellerCspProduction: CspDirectives = {
  ...sellerCsp,
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://js.stripe.com",
    "https://connect-js.stripe.com",
  ],
};

/**
 * Get seller CSP based on environment
 */
export function getSellerCsp(isDev: boolean = false): CspDirectives {
  return isDev ? sellerCsp : sellerCspProduction;
}
