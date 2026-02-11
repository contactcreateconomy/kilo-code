/**
 * Audit Logging Utilities
 *
 * Provides audit log entry creation and action type constants
 * for the Createconomy platform.
 * Extracted from security.ts for Single Responsibility Principle compliance.
 *
 * @module
 */

// ============================================================================
// Types
// ============================================================================

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
