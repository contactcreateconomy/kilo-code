import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * Affiliate Program Functions
 *
 * Manage affiliate relationships, tracking, and commission credits.
 * Gumroad equivalent: Affiliate program with referral codes and commission tracking.
 */

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a random affiliate code.
 */
function generateAffiliateCode(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Get affiliates for a seller (seller view).
 */
export const getSellerAffiliates = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("suspended")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    let affiliatesQuery = ctx.db
      .query("affiliates")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId));

    const affiliates = await affiliatesQuery.take(limit);

    // Filter by status in memory if provided
    const filtered = args.status
      ? affiliates.filter((a) => a.status === args.status)
      : affiliates;

    // Enrich with user details
    const items = await Promise.all(
      filtered.map(async (affiliate) => {
        const user = await ctx.db.get(affiliate.affiliateUserId);
        const profile = user
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first()
          : null;

        let productName: string | null = null;
        if (affiliate.productId) {
          const product = await ctx.db.get(affiliate.productId);
          productName = product?.name ?? null;
        }

        return {
          ...affiliate,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                displayName: profile?.displayName,
                avatarUrl: profile?.avatarUrl,
              }
            : null,
          productName,
        };
      })
    );

    return { items };
  },
});

/**
 * Get the current user's affiliate memberships (affiliate view).
 */
export const getMyAffiliatePrograms = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const affiliates = await ctx.db
      .query("affiliates")
      .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", userId))
      .take(limit);

    const items = await Promise.all(
      affiliates.map(async (affiliate) => {
        const seller = await ctx.db.get(affiliate.sellerId);
        const sellerProfile = seller
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", seller._id))
              .first()
          : null;

        let productName: string | null = null;
        if (affiliate.productId) {
          const product = await ctx.db.get(affiliate.productId);
          productName = product?.name ?? null;
        }

        return {
          ...affiliate,
          seller: seller
            ? {
                _id: seller._id,
                name: seller.name,
                displayName: sellerProfile?.displayName,
              }
            : null,
          productName,
        };
      })
    );

    return { items };
  },
});

/**
 * Get affiliate credits/commissions.
 */
export const getAffiliateCredits = query({
  args: {
    affiliateId: v.id("affiliates"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) {
      return { items: [] };
    }

    // Only the affiliate user or the seller can view credits
    if (affiliate.affiliateUserId !== userId && affiliate.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    const limit = args.limit ?? 50;

    const credits = await ctx.db
      .query("affiliateCredits")
      .withIndex("by_affiliate", (q) => q.eq("affiliateId", args.affiliateId))
      .order("desc")
      .take(limit);

    return { items: credits };
  },
});

/**
 * Resolve an affiliate code to an affiliate record (used at checkout).
 */
export const resolveAffiliateCode = query({
  args: {
    code: v.string(),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("affiliateCode", args.code))
      .first();

    if (!affiliate || affiliate.status !== "approved") {
      return null;
    }

    // If product-specific, verify it matches
    if (affiliate.productId && args.productId && affiliate.productId !== args.productId) {
      return null;
    }

    return {
      _id: affiliate._id,
      sellerId: affiliate.sellerId,
      commissionPercent: affiliate.commissionPercent,
      affiliateCode: affiliate.affiliateCode,
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Apply to become an affiliate for a seller (user action).
 */
export const applyAsAffiliate = mutation({
  args: {
    sellerId: v.id("users"),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    if (userId === args.sellerId) {
      throw createError(ErrorCode.INVALID_INPUT, "Cannot be your own affiliate");
    }

    // Check for existing application
    const existing = await ctx.db
      .query("affiliates")
      .withIndex("by_affiliate", (q) => q.eq("affiliateUserId", userId))
      .filter((q) => q.eq(q.field("sellerId"), args.sellerId))
      .first();

    if (existing) {
      throw createError(
        ErrorCode.ALREADY_EXISTS,
        "You already have an affiliate relationship with this seller"
      );
    }

    const affiliateCode = generateAffiliateCode();
    const now = Date.now();

    const affiliateId = await ctx.db.insert("affiliates", {
      sellerId: args.sellerId,
      affiliateUserId: userId,
      productId: args.productId,
      commissionPercent: 25, // Default 25% commission
      affiliateCode,
      status: "pending",
      totalClicks: 0,
      totalSales: 0,
      totalEarned: 0,
      createdAt: now,
      updatedAt: now,
    });

    return affiliateId;
  },
});

/**
 * Approve/reject an affiliate application (seller action).
 */
export const updateAffiliateStatus = mutation({
  args: {
    affiliateId: v.id("affiliates"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("suspended")
    ),
    commissionPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate) {
      throw createError(ErrorCode.NOT_FOUND, "Affiliate not found");
    }

    if (affiliate.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    if (
      args.commissionPercent !== undefined &&
      (args.commissionPercent < 1 || args.commissionPercent > 100)
    ) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        "Commission must be between 1% and 100%"
      );
    }

    await ctx.db.patch(args.affiliateId, {
      status: args.status,
      ...(args.commissionPercent !== undefined
        ? { commissionPercent: args.commissionPercent }
        : {}),
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Record an affiliate click (increment counter).
 */
export const recordAffiliateClick = mutation({
  args: {
    affiliateCode: v.string(),
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("affiliateCode", args.affiliateCode))
      .first();

    if (!affiliate || affiliate.status !== "approved") {
      return;
    }

    await ctx.db.patch(affiliate._id, {
      totalClicks: affiliate.totalClicks + 1,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create an affiliate credit (called after a sale attributed to an affiliate).
 */
export const createAffiliateCredit = mutation({
  args: {
    affiliateId: v.id("affiliates"),
    orderId: v.id("orders"),
    orderItemId: v.optional(v.id("orderItems")),
    amount: v.number(), // Commission amount in cents
  },
  handler: async (ctx, args) => {
    const affiliate = await ctx.db.get(args.affiliateId);
    if (!affiliate || affiliate.status !== "approved") {
      return null;
    }

    const now = Date.now();

    const creditId = await ctx.db.insert("affiliateCredits", {
      affiliateId: args.affiliateId,
      orderId: args.orderId,
      orderItemId: args.orderItemId,
      amount: args.amount,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Update affiliate totals
    await ctx.db.patch(args.affiliateId, {
      totalSales: affiliate.totalSales + 1,
      totalEarned: affiliate.totalEarned + args.amount,
      updatedAt: now,
    });

    return creditId;
  },
});
