/**
 * Shared business logic constants for the Createconomy platform.
 * Used for input validation across Convex functions.
 *
 * These constants define the business rules and limits for the platform.
 * They are separate from Convex's built-in argument validators (which handle
 * type checking) and instead enforce domain-specific constraints such as
 * price ranges, string length limits, and slug format requirements.
 *
 * @module
 */

export const PRODUCT_LIMITS = {
  MIN_PRICE_CENTS: 100, // $1.00 minimum
  MAX_PRICE_CENTS: 100_000_00, // $100,000.00 maximum
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 10_000,
  MAX_IMAGES: 20,
  MAX_TAGS: 20,
} as const;

export const ORDER_LIMITS = {
  MIN_ORDER_TOTAL_CENTS: 100, // $1.00 minimum order
  MAX_ITEMS_PER_ORDER: 50,
} as const;

export const USER_LIMITS = {
  MAX_USERNAME_LENGTH: 30,
  MIN_USERNAME_LENGTH: 3,
  MAX_BIO_LENGTH: 500,
} as const;

/**
 * Valid slug pattern: lowercase alphanumeric segments separated by hyphens.
 * Examples: "my-product", "cool-widget-2024", "a"
 * Invalid: "My-Product", "cool--widget", "-start", "end-"
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Soft-delete cleanup configuration.
 * Used by the scheduled cleanup cron job to permanently remove
 * soft-deleted records after a retention period.
 */
export const SOFT_DELETE_CLEANUP = {
  /** Number of days to retain soft-deleted records before permanent deletion */
  RETENTION_DAYS: 30,
  /** Maximum records to delete per cron invocation to avoid timeouts */
  BATCH_SIZE: 100,
} as const;
