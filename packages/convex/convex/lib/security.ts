/**
 * Server-Side Security Utilities for Convex
 *
 * Provides rate limiting, IP-based throttling, request validation,
 * and audit logging helpers for the Createconomy platform.
 */

import { v } from "convex/values";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";

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

export interface AuditLogEntry {
  /** Timestamp of the action */
  timestamp: number;
  /** User ID performing the action */
  userId?: string;
  /** Action type */
  action: string;
  /** Resource type affected */
  resourceType: string;
  /** Resource ID affected */
  resourceId?: string;
  /** IP address (if available) */
  ipAddress?: string;
  /** User agent (if available) */
  userAgent?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Whether the action was successful */
  success: boolean;
  /** Error message if failed */
  errorMessage?: string;
}

export interface SecurityContext {
  /** User ID from authentication */
  userId?: string;
  /** User's role */
  role?: string;
  /** IP address */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Request timestamp */
  timestamp: number;
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
// Rate Limiting Helpers
// ============================================================================

/**
 * Check rate limit for a given key
 *
 * This is a helper function that should be used with a rate limit table in Convex.
 * The actual implementation requires storing timestamps in the database.
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
// Request Validation
// ============================================================================

/**
 * Validate that a request has required authentication
 *
 * @param ctx - Convex context
 * @throws Error if not authenticated
 */
export async function requireAuth(
  ctx: GenericQueryCtx<unknown> | GenericMutationCtx<unknown>
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity.subject;
}

/**
 * Validate that a user has a specific role
 *
 * @param userRole - User's current role
 * @param requiredRole - Required role
 * @param roleHierarchy - Role hierarchy (lower index = lower privilege)
 * @throws Error if user doesn't have required role
 */
export function requireRole(
  userRole: string,
  requiredRole: string,
  roleHierarchy: readonly string[] = ["customer", "seller", "moderator", "admin"]
): void {
  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);

  if (userIndex === -1) {
    throw new Error("Invalid user role");
  }

  if (requiredIndex === -1) {
    throw new Error("Invalid required role");
  }

  if (userIndex < requiredIndex) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }
}

/**
 * Validate that a user owns a resource or has admin privileges
 *
 * @param userId - Current user ID
 * @param resourceOwnerId - Resource owner ID
 * @param userRole - User's role
 * @param adminRoles - Roles that can access any resource
 * @throws Error if user doesn't have access
 */
export function requireOwnershipOrAdmin(
  userId: string,
  resourceOwnerId: string,
  userRole: string,
  adminRoles: string[] = ["admin", "moderator"]
): void {
  if (userId === resourceOwnerId) {
    return; // Owner has access
  }

  if (adminRoles.includes(userRole)) {
    return; // Admin has access
  }

  throw new Error("Access denied. You don't have permission to access this resource.");
}

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Validate and sanitize a string input
 *
 * @param input - Input string
 * @param options - Validation options
 * @returns Sanitized string
 * @throws Error if validation fails
 */
export function validateString(
  input: unknown,
  options: {
    fieldName: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  }
): string {
  const { fieldName, minLength = 0, maxLength = 10000, pattern, required = true } = options;

  if (input === null || input === undefined || input === "") {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return "";
  }

  if (typeof input !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} must be at most ${maxLength} characters`);
  }

  if (pattern && !pattern.test(trimmed)) {
    throw new Error(`${fieldName} has an invalid format`);
  }

  return trimmed;
}

/**
 * Validate a numeric input
 *
 * @param input - Input value
 * @param options - Validation options
 * @returns Validated number
 * @throws Error if validation fails
 */
export function validateNumber(
  input: unknown,
  options: {
    fieldName: string;
    min?: number;
    max?: number;
    integer?: boolean;
    required?: boolean;
  }
): number {
  const { fieldName, min, max, integer = false, required = true } = options;

  if (input === null || input === undefined) {
    if (required) {
      throw new Error(`${fieldName} is required`);
    }
    return 0;
  }

  const num = typeof input === "string" ? parseFloat(input) : input;

  if (typeof num !== "number" || isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (integer && !Number.isInteger(num)) {
    throw new Error(`${fieldName} must be an integer`);
  }

  if (min !== undefined && num < min) {
    throw new Error(`${fieldName} must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`${fieldName} must be at most ${max}`);
  }

  return num;
}

/**
 * Validate an email address
 *
 * @param email - Email to validate
 * @returns Validated email (lowercase)
 * @throws Error if invalid
 */
export function validateEmail(email: unknown): string {
  const validated = validateString(email, {
    fieldName: "Email",
    maxLength: 254,
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(validated)) {
    throw new Error("Invalid email format");
  }

  return validated.toLowerCase();
}

/**
 * Validate a URL
 *
 * @param url - URL to validate
 * @param options - Validation options
 * @returns Validated URL
 * @throws Error if invalid
 */
export function validateUrl(
  url: unknown,
  options: {
    required?: boolean;
    allowedProtocols?: string[];
  } = {}
): string {
  const { required = true, allowedProtocols = ["http:", "https:"] } = options;

  const validated = validateString(url, {
    fieldName: "URL",
    maxLength: 2048,
    required,
  });

  if (!validated) {
    return "";
  }

  try {
    const parsed = new URL(validated);
    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error(`URL must use one of: ${allowedProtocols.join(", ")}`);
    }
    return parsed.href;
  } catch {
    throw new Error("Invalid URL format");
  }
}

// ============================================================================
// Audit Logging Helpers
// ============================================================================

/**
 * Create an audit log entry
 *
 * @param params - Audit log parameters
 * @returns Audit log entry
 */
export function createAuditLogEntry(params: {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}): AuditLogEntry {
  return {
    timestamp: Date.now(),
    userId: params.userId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ipAddress: params.ipAddress ? maskIpAddress(params.ipAddress) : undefined,
    userAgent: params.userAgent ? truncateUserAgent(params.userAgent) : undefined,
    metadata: params.metadata,
    success: params.success,
    errorMessage: params.errorMessage,
  };
}

/**
 * Mask an IP address for privacy
 *
 * @param ip - IP address to mask
 * @returns Masked IP address
 */
function maskIpAddress(ip: string): string {
  // IPv4: mask last octet
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }

  // IPv6: mask last 64 bits
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(":") + ":xxxx:xxxx:xxxx:xxxx";
    }
  }

  return "xxx.xxx.xxx.xxx";
}

/**
 * Truncate user agent string for storage
 *
 * @param userAgent - User agent string
 * @returns Truncated user agent
 */
function truncateUserAgent(userAgent: string): string {
  const maxLength = 256;
  if (userAgent.length <= maxLength) {
    return userAgent;
  }
  return userAgent.substring(0, maxLength - 3) + "...";
}

// ============================================================================
// Security Action Types
// ============================================================================

/**
 * Common audit action types
 */
export const AuditActions = {
  // Authentication
  LOGIN: "auth.login",
  LOGOUT: "auth.logout",
  LOGIN_FAILED: "auth.login_failed",
  PASSWORD_CHANGE: "auth.password_change",
  PASSWORD_RESET_REQUEST: "auth.password_reset_request",
  PASSWORD_RESET_COMPLETE: "auth.password_reset_complete",
  EMAIL_VERIFICATION: "auth.email_verification",
  TWO_FACTOR_ENABLE: "auth.2fa_enable",
  TWO_FACTOR_DISABLE: "auth.2fa_disable",

  // User Management
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_SUSPEND: "user.suspend",
  USER_UNSUSPEND: "user.unsuspend",
  ROLE_CHANGE: "user.role_change",

  // Product Management
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",
  PRODUCT_PUBLISH: "product.publish",
  PRODUCT_UNPUBLISH: "product.unpublish",

  // Order Management
  ORDER_CREATE: "order.create",
  ORDER_UPDATE: "order.update",
  ORDER_CANCEL: "order.cancel",
  ORDER_REFUND: "order.refund",
  ORDER_COMPLETE: "order.complete",

  // Payment
  PAYMENT_INITIATE: "payment.initiate",
  PAYMENT_COMPLETE: "payment.complete",
  PAYMENT_FAILED: "payment.failed",
  PAYOUT_REQUEST: "payment.payout_request",
  PAYOUT_COMPLETE: "payment.payout_complete",

  // Content Moderation
  CONTENT_FLAG: "moderation.flag",
  CONTENT_APPROVE: "moderation.approve",
  CONTENT_REJECT: "moderation.reject",
  CONTENT_REMOVE: "moderation.remove",

  // Forum
  THREAD_CREATE: "forum.thread_create",
  THREAD_DELETE: "forum.thread_delete",
  POST_CREATE: "forum.post_create",
  POST_DELETE: "forum.post_delete",
  POST_EDIT: "forum.post_edit",

  // Reviews
  REVIEW_CREATE: "review.create",
  REVIEW_UPDATE: "review.update",
  REVIEW_DELETE: "review.delete",

  // Admin Actions
  ADMIN_SETTINGS_UPDATE: "admin.settings_update",
  ADMIN_EXPORT_DATA: "admin.export_data",
  ADMIN_IMPORT_DATA: "admin.import_data",

  // Security Events
  SUSPICIOUS_ACTIVITY: "security.suspicious_activity",
  RATE_LIMIT_EXCEEDED: "security.rate_limit_exceeded",
  INVALID_TOKEN: "security.invalid_token",
  PERMISSION_DENIED: "security.permission_denied",
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];

// ============================================================================
// Convex Validators
// ============================================================================

/**
 * Convex validators for security-related fields
 */
export const securityValidators = {
  /** Rate limit key validator */
  rateLimitKey: v.string(),

  /** Timestamp array for rate limiting */
  timestamps: v.array(v.number()),

  /** Audit log entry validator */
  auditLogEntry: v.object({
    timestamp: v.number(),
    userId: v.optional(v.string()),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadata: v.optional(v.any()),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
  }),

  /** Security context validator */
  securityContext: v.object({
    userId: v.optional(v.string()),
    role: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  }),
};

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Check if a string contains potential SQL injection patterns
 *
 * @param input - Input to check
 * @returns True if suspicious patterns found
 */
export function hasSqlInjectionPatterns(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
    /(\b(UNION|JOIN)\b.*\b(SELECT)\b)/i,
    /(--|#|\/\*)/,
    /(\bOR\b|\bAND\b).*[=<>]/i,
    /['";]/,
    /\b(EXEC|EXECUTE|xp_)\b/i,
  ];

  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Check if a string contains potential NoSQL injection patterns
 *
 * @param input - Input to check
 * @returns True if suspicious patterns found
 */
export function hasNoSqlInjectionPatterns(input: string): boolean {
  const patterns = [
    /\$where/i,
    /\$gt|\$lt|\$gte|\$lte|\$ne|\$eq/i,
    /\$regex/i,
    /\$or|\$and|\$not|\$nor/i,
    /\{\s*['"]\$\w+['"]\s*:/,
  ];

  return patterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize input by removing potential injection patterns
 *
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export function sanitizeForDatabase(input: string): string {
  return input
    .replace(/['"`;\\]/g, "") // Remove quotes and special chars
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comment start
    .replace(/\*\//g, "") // Remove block comment end
    .replace(/\$/g, "") // Remove MongoDB operators
    .trim();
}
