/**
 * Standardized Error Utilities for the Createconomy Platform
 *
 * This module provides consistent error handling across all Convex functions.
 *
 * ## Error Handling Strategy
 *
 * 1. **`ConvexError` (via `createError`)** — Use for ALL user-facing errors in
 *    Convex queries, mutations, and actions. These errors carry a structured
 *    `{ code, message, ...details }` payload that clients can parse and display
 *    or act on programmatically.
 *
 * 2. **Plain `Error`** — Use ONLY for truly unexpected system failures (e.g.
 *    programmer errors, invariant violations) that should never reach the user.
 *    These are logged by Convex and surfaced as generic "Internal Server Error"
 *    messages to clients.
 *
 * 3. **`null` returns** — Acceptable ONLY for "not found" queries where the
 *    absence of a resource is an expected, normal result (e.g. `getProduct`
 *    returning `null` when a product doesn't exist). Do NOT return `null` for
 *    error conditions in mutations or actions — throw a `ConvexError` instead.
 *
 * ## Usage
 *
 * ```ts
 * import { createError, ErrorCode } from '../lib/errors';
 *
 * // In a mutation handler:
 * throw createError(ErrorCode.NOT_FOUND, 'Product not found');
 *
 * // With additional details:
 * throw createError(ErrorCode.INSUFFICIENT_INVENTORY, 'Not enough stock', {
 *   requested: 5,
 *   available: 2,
 * });
 * ```
 *
 * ## Guidelines for New Functions
 *
 * - All new Convex functions should include explicit return type annotations.
 * - All new user-facing errors should use `createError` from this module.
 * - Existing code will be gradually migrated to use these patterns.
 */

import { ConvexError } from 'convex/values';

/**
 * Standardized error codes for the Createconomy platform.
 * Use ConvexError for all user-facing errors in Convex functions.
 */
export const ErrorCode = {
  // Authentication & Authorization
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Business logic errors
  INSUFFICIENT_INVENTORY: 'INSUFFICIENT_INVENTORY',
  ORDER_NOT_MODIFIABLE: 'ORDER_NOT_MODIFIABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',

  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Create a structured ConvexError with consistent shape.
 * All user-facing errors should use this factory.
 *
 * @param code - One of the standardized ErrorCode values
 * @param message - Human-readable error message
 * @param details - Optional additional context (e.g. field names, IDs)
 * @returns A ConvexError instance with `{ code, message, ...details }`
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, string | number | boolean>
) {
  return new ConvexError({ code, message, ...details });
}
