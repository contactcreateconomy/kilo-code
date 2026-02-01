/**
 * Forum CSP Configuration
 *
 * Content Security Policy for the forum application.
 * Allows necessary resources for community discussions.
 */

import type { CspDirectives } from "../security-headers";

/**
 * Forum-specific CSP directives
 */
export const forumCsp: CspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
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
    "https:",
    "https://avatars.githubusercontent.com",
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
    "https://*.convex.cloud",
    "wss://*.convex.cloud",
    "https://www.google-analytics.com",
    "https://vitals.vercel-insights.com",
  ],
  "frame-src": ["'self'"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": true,
};

/**
 * Production CSP (stricter)
 */
export const forumCspProduction: CspDirectives = {
  ...forumCsp,
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ],
};

/**
 * Get forum CSP based on environment
 */
export function getForumCsp(isDev: boolean = false): CspDirectives {
  return isDev ? forumCsp : forumCspProduction;
}
