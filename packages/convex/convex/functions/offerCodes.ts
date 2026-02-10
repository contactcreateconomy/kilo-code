import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * Offer Codes / Discount Codes Functions
 *
 * Create, validate, and manage discount codes for sellers.
 * Gumroad equivalent: Offer codes / discount codes feature.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all offer codes for the current seller.
 */
export const getSellerOfferCodes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const codes = await ctx.db
      .query("offerCodes")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .order("desc")
      .take(limit);

    // Enrich with product name if applicable
    const items = await Promise.all(
      codes.map(async (code) => {
        let productName: string | null = null;
        if (code.productId) {
          const product = await ctx.db.get(code.productId);
          productName = product?.name ?? null;
        }
        return {
          ...code,
          productName,
        };
      })
    );

    return { items };
  },
});

/**
 * Get a single offer code by ID.
 */
export const getOfferCode = query({
  args: {
    offerCodeId: v.id("offerCodes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const code = await ctx.db.get(args.offerCodeId);
    if (!code) {
      return null;
    }

    if (code.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    return code;
  },
});

/**
 * Validate an offer code at checkout (public).
 */
export const validateOfferCode = query({
  args: {
    code: v.string(),
    productId: v.optional(v.id("products")),
    orderAmount: v.optional(v.number()), // cents
  },
  handler: async (ctx, args) => {
    const normalizedCode = args.code.toUpperCase().trim();

    const offerCode = await ctx.db
      .query("offerCodes")
      .withIndex("by_code", (q) => q.eq("code", normalizedCode))
      .first();

    if (!offerCode) {
      return {
        valid: false,
        message: "Invalid discount code",
      };
    }

    if (!offerCode.isActive) {
      return {
        valid: false,
        message: "This discount code is no longer active",
      };
    }

    const now = Date.now();

    if (offerCode.startsAt && now < offerCode.startsAt) {
      return {
        valid: false,
        message: "This discount code is not yet active",
      };
    }

    if (offerCode.expiresAt && now > offerCode.expiresAt) {
      return {
        valid: false,
        message: "This discount code has expired",
      };
    }

    if (offerCode.maxUses && offerCode.currentUses >= offerCode.maxUses) {
      return {
        valid: false,
        message: "This discount code has reached its usage limit",
      };
    }

    // Check product scope
    if (offerCode.productId && args.productId && offerCode.productId !== args.productId) {
      return {
        valid: false,
        message: "This discount code is not valid for this product",
      };
    }

    // Check minimum order amount
    if (offerCode.minOrderAmount && args.orderAmount && args.orderAmount < offerCode.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of $${(offerCode.minOrderAmount / 100).toFixed(2)} required`,
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (args.orderAmount) {
      if (offerCode.discountType === "percent") {
        discountAmount = Math.round((args.orderAmount * offerCode.discountValue) / 100);
      } else {
        discountAmount = Math.min(offerCode.discountValue, args.orderAmount);
      }
    }

    return {
      valid: true,
      message: "Discount code applied",
      offerCode: {
        _id: offerCode._id,
        code: offerCode.code,
        discountType: offerCode.discountType,
        discountValue: offerCode.discountValue,
        discountAmount,
      },
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create an offer code (seller only).
 */
export const createOfferCode = mutation({
  args: {
    code: v.string(),
    discountType: v.union(v.literal("percent"), v.literal("fixed")),
    discountValue: v.number(),
    productId: v.optional(v.id("products")),
    tenantId: v.optional(v.id("tenants")),
    maxUses: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    // Verify seller role
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.defaultRole !== "seller" && profile.defaultRole !== "admin")) {
      throw createError(ErrorCode.UNAUTHORIZED, "Seller role required");
    }

    // Normalize code
    const normalizedCode = args.code.toUpperCase().trim();

    if (normalizedCode.length < 2 || normalizedCode.length > 30) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        "Code must be between 2 and 30 characters"
      );
    }

    // Validate discount value
    if (args.discountType === "percent") {
      if (args.discountValue < 1 || args.discountValue > 100) {
        throw createError(
          ErrorCode.INVALID_INPUT,
          "Percentage discount must be between 1 and 100"
        );
      }
    } else {
      if (args.discountValue < 1) {
        throw createError(
          ErrorCode.INVALID_INPUT,
          "Fixed discount must be at least 1 cent"
        );
      }
    }

    // Check for duplicate code by this seller
    const existing = await ctx.db
      .query("offerCodes")
      .withIndex("by_seller_code", (q) =>
        q.eq("sellerId", userId).eq("code", normalizedCode)
      )
      .first();

    if (existing) {
      throw createError(
        ErrorCode.ALREADY_EXISTS,
        `An offer code "${normalizedCode}" already exists`
      );
    }

    // If product-scoped, verify ownership
    if (args.productId) {
      const product = await ctx.db.get(args.productId);
      if (!product || product.isDeleted || product.sellerId !== userId) {
        throw createError(ErrorCode.NOT_FOUND, "Product not found");
      }
    }

    const now = Date.now();

    const offerCodeId = await ctx.db.insert("offerCodes", {
      sellerId: userId,
      tenantId: args.tenantId,
      code: normalizedCode,
      discountType: args.discountType,
      discountValue: args.discountValue,
      productId: args.productId,
      maxUses: args.maxUses,
      currentUses: 0,
      minOrderAmount: args.minOrderAmount,
      startsAt: args.startsAt,
      expiresAt: args.expiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return offerCodeId;
  },
});

/**
 * Update an offer code (seller only).
 */
export const updateOfferCode = mutation({
  args: {
    offerCodeId: v.id("offerCodes"),
    discountType: v.optional(v.union(v.literal("percent"), v.literal("fixed"))),
    discountValue: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const code = await ctx.db.get(args.offerCodeId);
    if (!code) {
      throw createError(ErrorCode.NOT_FOUND, "Offer code not found");
    }

    if (code.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    const { offerCodeId: _id, ...updates } = args;

    await ctx.db.patch(args.offerCodeId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete (deactivate) an offer code.
 */
export const deleteOfferCode = mutation({
  args: {
    offerCodeId: v.id("offerCodes"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const code = await ctx.db.get(args.offerCodeId);
    if (!code) {
      throw createError(ErrorCode.NOT_FOUND, "Offer code not found");
    }

    if (code.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    await ctx.db.patch(args.offerCodeId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Increment usage count for an offer code (called after successful checkout).
 */
export const incrementOfferCodeUsage = mutation({
  args: {
    offerCodeId: v.id("offerCodes"),
  },
  handler: async (ctx, args) => {
    const code = await ctx.db.get(args.offerCodeId);
    if (!code) {
      return;
    }

    await ctx.db.patch(args.offerCodeId, {
      currentUses: code.currentUses + 1,
      updatedAt: Date.now(),
    });

    // Auto-deactivate if max uses reached
    if (code.maxUses && code.currentUses + 1 >= code.maxUses) {
      await ctx.db.patch(args.offerCodeId, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }
  },
});
