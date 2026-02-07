/**
 * Order Utility Functions
 *
 * Shared utilities for order-related operations across the Createconomy platform.
 * Centralizes order number generation to avoid duplication between orders.ts and stripe.ts.
 */

/**
 * Generates a unique order number using crypto-secure randomness.
 * Format: ORD-{timestamp}-{random-hex}
 *
 * BUG FIX B5: Replaces duplicated Math.random()-based generation in orders.ts
 * and stripe.ts with a single crypto-secure implementation. Math.random() is
 * not cryptographically secure and not guaranteed unique across concurrent calls.
 *
 * Note: Callers should still check for collisions in the database before inserting,
 * as timestamp + 8 hex chars is highly unlikely but not impossible to collide.
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now();
  const randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `ORD-${timestamp}-${randomPart}`;
}
