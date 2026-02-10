import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * Product Variants Functions
 *
 * CRUD for product pricing tiers / variants (e.g., Basic, Pro, Enterprise).
 * Gumroad equivalent: Pricing tiers on product pages.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all variants for a product.
 */
export const getProductVariants = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    return variants;
  },
});

/**
 * Get a single variant by ID.
 */
export const getVariant = query({
  args: {
    variantId: v.id("productVariants"),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.isDeleted) {
      return null;
    }
    return variant;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a product variant (seller only).
 */
export const createVariant = mutation({
  args: {
    productId: v.id("products"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    if (product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    if (args.price < 0) {
      throw createError(ErrorCode.INVALID_INPUT, "Price must be non-negative");
    }

    // Get current max sort order
    const existingVariants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const maxSortOrder = existingVariants.reduce(
      (max, v) => Math.max(max, v.sortOrder),
      -1
    );

    // If setting as default, unset other defaults
    if (args.isDefault) {
      for (const variant of existingVariants) {
        if (variant.isDefault) {
          await ctx.db.patch(variant._id, {
            isDefault: false,
            updatedAt: Date.now(),
          });
        }
      }
    }

    const now = Date.now();

    const variantId = await ctx.db.insert("productVariants", {
      productId: args.productId,
      name: args.name,
      description: args.description,
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      maxQuantity: args.maxQuantity,
      sortOrder: maxSortOrder + 1,
      isDefault: args.isDefault ?? existingVariants.length === 0, // First variant is default
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return variantId;
  },
});

/**
 * Update a product variant (seller only).
 */
export const updateVariant = mutation({
  args: {
    variantId: v.id("productVariants"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    maxQuantity: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Variant not found");
    }

    const product = await ctx.db.get(variant.productId);
    if (!product || product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    if (args.price !== undefined && args.price < 0) {
      throw createError(ErrorCode.INVALID_INPUT, "Price must be non-negative");
    }

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const siblings = await ctx.db
        .query("productVariants")
        .withIndex("by_product", (q) => q.eq("productId", variant.productId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();

      for (const sibling of siblings) {
        if (sibling._id !== args.variantId && sibling.isDefault) {
          await ctx.db.patch(sibling._id, {
            isDefault: false,
            updatedAt: Date.now(),
          });
        }
      }
    }

    const { variantId: _variantId, ...updates } = args;

    await ctx.db.patch(args.variantId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete a product variant (soft delete, seller only).
 */
export const deleteVariant = mutation({
  args: {
    variantId: v.id("productVariants"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Variant not found");
    }

    const product = await ctx.db.get(variant.productId);
    if (!product || product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    await ctx.db.patch(args.variantId, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // If we deleted the default, set the next one as default
    if (variant.isDefault) {
      const remaining = await ctx.db
        .query("productVariants")
        .withIndex("by_product", (q) => q.eq("productId", variant.productId))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .first();

      if (remaining) {
        await ctx.db.patch(remaining._id, {
          isDefault: true,
          updatedAt: Date.now(),
        });
      }
    }

    return true;
  },
});

/**
 * Reorder product variants (seller only).
 */
export const reorderVariants = mutation({
  args: {
    productId: v.id("products"),
    variantIds: v.array(v.id("productVariants")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    for (let i = 0; i < args.variantIds.length; i++) {
      await ctx.db.patch(args.variantIds[i]!, {
        sortOrder: i,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});
