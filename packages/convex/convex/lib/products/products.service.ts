/**
 * Products Domain Service
 *
 * Pure business-logic functions for the products domain.
 * No DB access — all data is received as parameters.
 */

import { createError, ErrorCode } from "../errors";
import { PRODUCT_LIMITS, SLUG_PATTERN } from "../constants";

/**
 * Validate that a product slug matches the required format.
 */
export function validateProductSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw createError(
      ErrorCode.INVALID_INPUT,
      'Slug must be lowercase alphanumeric characters separated by hyphens (e.g. "my-product")',
      { field: "slug" }
    );
  }
}

/**
 * Validate that a slug is unique (no active product with same slug).
 *
 * @param existingProduct - The product found by slug query, or null
 */
export function validateSlugUniqueness(
  existingProduct: { isDeleted?: boolean } | null,
  slug: string,
  tenantScoped: boolean
): void {
  if (existingProduct && !existingProduct.isDeleted) {
    const scope = tenantScoped ? " in this tenant" : "";
    throw createError(
      ErrorCode.ALREADY_EXISTS,
      `A product with slug "${slug}" already exists${scope}`,
      { field: "slug" }
    );
  }
}

/**
 * Validate product price against business limits.
 */
export function validateProductPrice(price: number): void {
  if (price < PRODUCT_LIMITS.MIN_PRICE_CENTS) {
    throw createError(
      ErrorCode.INVALID_INPUT,
      `Price must be at least ${PRODUCT_LIMITS.MIN_PRICE_CENTS} cents ($${(PRODUCT_LIMITS.MIN_PRICE_CENTS / 100).toFixed(2)})`,
      { field: "price", min: PRODUCT_LIMITS.MIN_PRICE_CENTS }
    );
  }
  if (price > PRODUCT_LIMITS.MAX_PRICE_CENTS) {
    throw createError(
      ErrorCode.INVALID_INPUT,
      `Price must not exceed ${PRODUCT_LIMITS.MAX_PRICE_CENTS} cents ($${(PRODUCT_LIMITS.MAX_PRICE_CENTS / 100).toFixed(2)})`,
      { field: "price", max: PRODUCT_LIMITS.MAX_PRICE_CENTS }
    );
  }
}
