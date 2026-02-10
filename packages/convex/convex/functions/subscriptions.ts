import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * Subscription Functions
 *
 * Manage recurring billing subscriptions for membership/subscription products.
 * Gumroad equivalent: Membership products with recurring billing.
 */

// ============================================================================
// Validators
// ============================================================================

const subscriptionStatusValidator = v.union(
  v.literal("active"),
  v.literal("paused"),
  v.literal("cancelled"),
  v.literal("past_due"),
  v.literal("trialing"),
  v.literal("incomplete")
);

const billingPeriodValidator = v.union(
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("yearly")
);

// ============================================================================
// Queries
// ============================================================================

/**
 * Get the current user's subscriptions (buyer view).
 */
export const getMySubscriptions = query({
  args: {
    status: v.optional(subscriptionStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(limit);

    // Filter by status in memory if provided
    const filtered = args.status
      ? subscriptions.filter((s) => s.status === args.status)
      : subscriptions;

    // Enrich with product details
    const items = await Promise.all(
      filtered.map(async (sub) => {
        const product = await ctx.db.get(sub.productId);
        const primaryImage = product
          ? await ctx.db
              .query("productImages")
              .withIndex("by_product_primary", (q) =>
                q.eq("productId", product._id).eq("isPrimary", true)
              )
              .first()
          : null;

        const seller = await ctx.db.get(sub.sellerId);

        return {
          ...sub,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                primaryImage: primaryImage?.url,
              }
            : null,
          seller: seller
            ? {
                _id: seller._id,
                name: seller.name,
              }
            : null,
        };
      })
    );

    return { items };
  },
});

/**
 * Get subscriptions for a seller's products (seller view).
 */
export const getSellerSubscriptions = query({
  args: {
    status: v.optional(subscriptionStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .take(limit);

    const filtered = args.status
      ? subscriptions.filter((s) => s.status === args.status)
      : subscriptions;

    // Enrich with user and product details
    const items = await Promise.all(
      filtered.map(async (sub) => {
        const user = await ctx.db.get(sub.userId);
        const product = await ctx.db.get(sub.productId);

        return {
          ...sub,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,
          product: product
            ? {
                _id: product._id,
                name: product.name,
              }
            : null,
        };
      })
    );

    return { items };
  },
});

/**
 * Get a single subscription by ID.
 */
export const getSubscription = query({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) {
      return null;
    }

    // Only the subscriber or seller can view
    if (sub.userId !== userId && sub.sellerId !== userId) {
      return null;
    }

    const product = await ctx.db.get(sub.productId);

    return {
      ...sub,
      product: product
        ? {
            _id: product._id,
            name: product.name,
            slug: product.slug,
          }
        : null,
    };
  },
});

/**
 * Get subscription stats for a seller.
 */
export const getSellerSubscriptionStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const allSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

    const active = allSubs.filter((s) => s.status === "active").length;
    const paused = allSubs.filter((s) => s.status === "paused").length;
    const cancelled = allSubs.filter((s) => s.status === "cancelled").length;
    const pastDue = allSubs.filter((s) => s.status === "past_due").length;
    const trialing = allSubs.filter((s) => s.status === "trialing").length;

    const monthlyRecurringRevenue = allSubs
      .filter((s) => s.status === "active")
      .reduce((sum, s) => {
        // Normalize to monthly
        let monthly = s.pricePerPeriod;
        if (s.billingPeriod === "quarterly") {
          monthly = Math.round(s.pricePerPeriod / 3);
        } else if (s.billingPeriod === "yearly") {
          monthly = Math.round(s.pricePerPeriod / 12);
        }
        return sum + monthly;
      }, 0);

    return {
      total: allSubs.length,
      active,
      paused,
      cancelled,
      pastDue,
      trialing,
      monthlyRecurringRevenue,
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a subscription (called after successful payment setup).
 */
export const createSubscription = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    sellerId: v.id("users"),
    tenantId: v.optional(v.id("tenants")),
    stripeSubscriptionId: v.optional(v.string()),
    pricePerPeriod: v.number(),
    billingPeriod: billingPeriodValidator,
    trialEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const callingUserId = await getAuthUserId(ctx);
    if (!callingUserId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const now = Date.now();
    const status = args.trialEnd ? "trialing" : "active";

    // Calculate period end based on billing period
    let periodEndMs: number;
    switch (args.billingPeriod) {
      case "monthly":
        periodEndMs = 30 * 24 * 60 * 60 * 1000;
        break;
      case "quarterly":
        periodEndMs = 90 * 24 * 60 * 60 * 1000;
        break;
      case "yearly":
        periodEndMs = 365 * 24 * 60 * 60 * 1000;
        break;
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      productId: args.productId,
      sellerId: args.sellerId,
      tenantId: args.tenantId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      status,
      pricePerPeriod: args.pricePerPeriod,
      billingPeriod: args.billingPeriod,
      currentPeriodStart: now,
      currentPeriodEnd: now + periodEndMs,
      cancelAtPeriodEnd: false,
      trialEnd: args.trialEnd,
      createdAt: now,
      updatedAt: now,
    });

    return subscriptionId;
  },
});

/**
 * Cancel a subscription (buyer action).
 * Cancels at the end of the current billing period by default.
 */
export const cancelSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    cancelImmediately: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) {
      throw createError(ErrorCode.NOT_FOUND, "Subscription not found");
    }

    if (sub.userId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    if (sub.status === "cancelled") {
      throw createError(ErrorCode.CONFLICT, "Subscription is already cancelled");
    }

    const now = Date.now();

    if (args.cancelImmediately) {
      await ctx.db.patch(args.subscriptionId, {
        status: "cancelled",
        cancelledAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(args.subscriptionId, {
        cancelAtPeriodEnd: true,
        cancelledAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Pause a subscription (buyer action).
 */
export const pauseSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) {
      throw createError(ErrorCode.NOT_FOUND, "Subscription not found");
    }

    if (sub.userId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    if (sub.status !== "active") {
      throw createError(
        ErrorCode.CONFLICT,
        "Only active subscriptions can be paused"
      );
    }

    await ctx.db.patch(args.subscriptionId, {
      status: "paused",
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Resume a paused subscription (buyer action).
 */
export const resumeSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) {
      throw createError(ErrorCode.NOT_FOUND, "Subscription not found");
    }

    if (sub.userId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    if (sub.status !== "paused") {
      throw createError(
        ErrorCode.CONFLICT,
        "Only paused subscriptions can be resumed"
      );
    }

    await ctx.db.patch(args.subscriptionId, {
      status: "active",
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Update subscription status (internal, typically called from Stripe webhooks).
 */
export const updateSubscriptionStatus = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    status: subscriptionStatusValidator,
    currentPeriodStart: v.optional(v.number()),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db.get(args.subscriptionId);
    if (!sub) {
      return;
    }

    await ctx.db.patch(args.subscriptionId, {
      status: args.status,
      ...(args.currentPeriodStart ? { currentPeriodStart: args.currentPeriodStart } : {}),
      ...(args.currentPeriodEnd ? { currentPeriodEnd: args.currentPeriodEnd } : {}),
      updatedAt: Date.now(),
    });
  },
});
