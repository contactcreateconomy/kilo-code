/**
 * Rate Limiting Utilities
 *
 * Provides in-memory and database-backed rate limiting for the Createconomy platform.
 * Extracted from security.ts for Single Responsibility Principle compliance.
 *
 * @module
 */

import { ConvexError } from "convex/values";
import type { MutationCtx } from "../_generated/server";

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Action name for logging */
  action: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests */
  remaining: number;
  /** Timestamp when the limit resets */
  resetAt: number;
  /** Time to wait before retrying (if limited) */
  retryAfter: number;
}

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

/**
 * Pre-defined rate limit configurations
 */
export const rateLimitConfigs = {
  /** Standard API calls - 100 per minute */
  standard: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    action: "api_call",
  } as RateLimitConfig,

  /** Authentication attempts - 5 per 15 minutes */
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    action: "auth_attempt",
  } as RateLimitConfig,

  /** Content creation - 10 per minute */
  contentCreation: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    action: "content_creation",
  } as RateLimitConfig,

  /** Search queries - 30 per minute */
  search: {
    maxRequests: 30,
    windowMs: 60 * 1000,
    action: "search",
  } as RateLimitConfig,

  /** File uploads - 5 per minute */
  upload: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    action: "file_upload",
  } as RateLimitConfig,

  /** Password reset - 3 per hour */
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    action: "password_reset",
  } as RateLimitConfig,

  /** Email verification - 5 per hour */
  emailVerification: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    action: "email_verification",
  } as RateLimitConfig,

  /** Order creation - 10 per hour */
  orderCreation: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    action: "order_creation",
  } as RateLimitConfig,

  /** Review submission - 5 per day */
  reviewSubmission: {
    maxRequests: 5,
    windowMs: 24 * 60 * 60 * 1000,
    action: "review_submission",
  } as RateLimitConfig,

  /** Report submission - 10 per day */
  reportSubmission: {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000,
    action: "report_submission",
  } as RateLimitConfig,
};

// ============================================================================
// In-Memory Rate Limiting
// ============================================================================

/**
 * Check rate limit for a given key using an in-memory timestamp array.
 *
 * @param timestamps - Array of previous request timestamps
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  timestamps: number[],
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Filter timestamps within the current window
  const recentTimestamps = timestamps.filter((t) => t > windowStart);
  const count = recentTimestamps.length;

  const allowed = count < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - count);

  // Calculate reset time based on oldest timestamp in window
  const oldestInWindow = recentTimestamps.length > 0
    ? Math.min(...recentTimestamps)
    : now;
  const resetAt = oldestInWindow + config.windowMs;

  return {
    allowed,
    remaining,
    resetAt,
    retryAfter: allowed ? 0 : resetAt - now,
  };
}

/**
 * Generate a rate limit key for a user and action
 *
 * @param userId - User ID
 * @param action - Action name
 * @returns Rate limit key
 */
export function getRateLimitKey(userId: string, action: string): string {
  return `ratelimit:${action}:${userId}`;
}

/**
 * Generate a rate limit key for an IP address and action
 *
 * @param ipAddress - IP address
 * @param action - Action name
 * @returns Rate limit key
 */
export function getIpRateLimitKey(ipAddress: string, action: string): string {
  // Hash the IP for privacy
  const hashedIp = simpleHash(ipAddress);
  return `ratelimit:ip:${action}:${hashedIp}`;
}

/**
 * Simple hash function for IP addresses
 * Note: This is not cryptographically secure, just for obfuscation
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// ============================================================================
// Database-Backed Rate Limiting
// ============================================================================

/**
 * Check and enforce a rate limit using the `rateLimitRecords` database table.
 *
 * Uses a **fixed-window** algorithm: each key gets a single counter that resets
 * when the window expires. This is simpler and cheaper than sliding windows
 * and is sufficient for abuse prevention.
 *
 * **Important**: This function performs a database write (upsert) to update the
 * counter, so it must be called from a **mutation** context (not a query).
 *
 * @param ctx - A Convex MutationCtx (needs db read/write access)
 * @param key - Unique identifier for the rate limit bucket,
 *   e.g. `"requestSellerRole:" + userId`
 * @param config - Rate limit configuration (maxRequests, windowMs, action)
 * @returns The rate limit result with `allowed`, `remaining`, `resetAt`, `retryAfter`
 * @throws ConvexError with code "RATE_LIMITED" if the limit is exceeded
 *
 * @example
 * ```ts
 * import { checkRateLimitWithDb, rateLimitConfigs } from "../lib/rate-limit";
 *
 * export const requestSellerRole = mutation({
 *   args: { businessName: v.string() },
 *   handler: async (ctx, args) => {
 *     const userId = await requireAuth(ctx);
 *     await checkRateLimitWithDb(
 *       ctx,
 *       `requestSellerRole:${userId}`,
 *       { maxRequests: 3, windowMs: 60 * 60 * 1000, action: "request_seller_role" }
 *     );
 *     // ... rest of handler
 *   },
 * });
 * ```
 */
export async function checkRateLimitWithDb(
  ctx: MutationCtx,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Look up existing record
  const existing = await ctx.db
    .query("rateLimitRecords")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (existing) {
    // Check if the window has expired — if so, reset the counter
    if (existing.windowStart < windowStart) {
      // Window expired; start a new one with count = 1
      await ctx.db.patch(existing._id, {
        count: 1,
        windowStart: now,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
        retryAfter: 0,
      };
    }

    // Window is still active — check if under the limit
    if (existing.count >= config.maxRequests) {
      const resetAt = existing.windowStart + config.windowMs;
      const result: RateLimitResult = {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: resetAt - now,
      };
      throw new ConvexError({
        code: "RATE_LIMITED",
        message: `Rate limit exceeded for ${config.action}. Try again in ${Math.ceil((resetAt - now) / 1000)} seconds.`,
        retryAfter: result.retryAfter,
      });
    }

    // Under the limit — increment
    const newCount = existing.count + 1;
    await ctx.db.patch(existing._id, { count: newCount });
    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt: existing.windowStart + config.windowMs,
      retryAfter: 0,
    };
  }

  // No existing record — create one with count = 1
  await ctx.db.insert("rateLimitRecords", {
    key,
    count: 1,
    windowStart: now,
  });

  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetAt: now + config.windowMs,
    retryAfter: 0,
  };
}
