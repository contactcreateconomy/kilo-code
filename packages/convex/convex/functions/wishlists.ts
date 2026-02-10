import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * Wishlist Functions
 *
 * Manage buyer wishlists (saved products for later).
 * Gumroad equivalent: "Library" / saved items feature.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get the current user's wishlist items with product details.
 */
export const getWishlist = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const wishlistItems = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Enrich with product details
    const items = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product || product.isDeleted) {
          return null;
        }

        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

        return {
          ...item,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            currency: product.currency,
            status: product.status,
            averageRating: product.averageRating,
            reviewCount: product.reviewCount,
            primaryImage: primaryImage?.url,
          },
        };
      })
    );

    return {
      items: items.filter(Boolean),
    };
  },
});

/**
 * Check if a product is in the current user's wishlist.
 */
export const isInWishlist = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    return existing !== null;
  },
});

/**
 * Get wishlist count for the current user.
 */
export const getWishlistCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const items = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return items.length;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Add a product to the current user's wishlist.
 */
export const addToWishlist = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    // Check product exists
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    // Don't allow adding own product
    if (product.sellerId === userId) {
      throw createError(ErrorCode.INVALID_INPUT, "Cannot add your own product to wishlist");
    }

    // Check for duplicate
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      return existing._id; // Already in wishlist
    }

    const wishlistId = await ctx.db.insert("wishlists", {
      userId,
      productId: args.productId,
      addedAt: Date.now(),
    });

    return wishlistId;
  },
});

/**
 * Remove a product from the current user's wishlist.
 */
export const removeFromWishlist = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (!existing) {
      return false;
    }

    await ctx.db.delete(existing._id);
    return true;
  },
});

/**
 * Toggle a product's wishlist status (add if not present, remove if present).
 */
export const toggleWishlist = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { inWishlist: false };
    }

    // Validate product
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    if (product.sellerId === userId) {
      throw createError(ErrorCode.INVALID_INPUT, "Cannot add your own product to wishlist");
    }

    await ctx.db.insert("wishlists", {
      userId,
      productId: args.productId,
      addedAt: Date.now(),
    });

    return { inWishlist: true };
  },
});
