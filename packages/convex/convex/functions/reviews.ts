import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";

/**
 * Review Management Functions
 *
 * Queries and mutations for managing product reviews
 * in the Createconomy marketplace.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get reviews for a product
 *
 * @param productId - Product ID
 * @param limit - Number of reviews to return
 * @param sortBy - Sort order (recent, helpful, rating_high, rating_low)
 * @returns List of reviews with user info
 */
export const getProductReviews = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
    sortBy: v.optional(
      v.union(
        v.literal("recent"),
        v.literal("helpful"),
        v.literal("rating_high"),
        v.literal("rating_low")
      )
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const sortBy = args.sortBy ?? "recent";

    let reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_approved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Sort reviews
    switch (sortBy) {
      case "helpful":
        reviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case "rating_high":
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case "rating_low":
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case "recent":
      default:
        reviews.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    // Limit results
    reviews = reviews.slice(0, limit);

    // Get user info for each review
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        const profile = user
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first()
          : null;

        return {
          id: review._id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isVerifiedPurchase: review.isVerifiedPurchase,
          helpfulCount: review.helpfulCount,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: user
            ? {
                id: user._id,
                name: user.name,
                displayName: profile?.displayName,
                avatarUrl: profile?.avatarUrl,
              }
            : null,
        };
      })
    );

    return reviewsWithUsers;
  },
});

/**
 * Get review statistics for a product
 *
 * @param productId - Product ID
 * @returns Review statistics
 */
export const getProductReviewStats = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_approved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
        verifiedPurchaseCount: 0,
      };
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    };

    const verifiedPurchaseCount = reviews.filter((r) => r.isVerifiedPurchase).length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      verifiedPurchaseCount,
    };
  },
});

/**
 * Get user's reviews
 *
 * @param limit - Number of reviews to return
 * @returns List of user's reviews
 */
export const getUserReviews = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit ?? 20;

    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    // Get product info for each review
    const reviewsWithProducts = await Promise.all(
      reviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        const primaryImage = product
          ? await ctx.db
              .query("productImages")
              .withIndex("by_product_primary", (q) =>
                q.eq("productId", product._id).eq("isPrimary", true)
              )
              .first()
          : null;

        return {
          ...review,
          product: product
            ? {
                id: product._id,
                name: product.name,
                slug: product.slug,
                primaryImage: primaryImage?.url,
              }
            : null,
        };
      })
    );

    return reviewsWithProducts;
  },
});

/**
 * Check if user can review a product
 *
 * @param productId - Product ID
 * @returns Whether user can review and reason
 */
export const canReviewProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { canReview: false, reason: "Authentication required" };
    }

    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .first();

    if (existingReview) {
      return { canReview: false, reason: "You have already reviewed this product" };
    }

    // Check if user has purchased this product
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const userOrderIds = new Set<Id<"orders">>();
    for (const item of orderItems) {
      const order = await ctx.db.get(item.orderId);
      if (order && order.userId === userId && order.status === "delivered") {
        userOrderIds.add(order._id);
      }
    }

    const hasPurchased = userOrderIds.size > 0;

    return {
      canReview: true,
      isVerifiedPurchase: hasPurchased,
      reason: hasPurchased
        ? "You can write a verified purchase review"
        : "You can write a review (not a verified purchase)",
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a review for a product
 *
 * A3 TODO: Add database-backed rate limiting here to prevent review spam.
 * Suggested config: rateLimitConfigs.reviewSubmission (5 per day).
 * Example:
 *   await checkRateLimitWithDb(ctx, `createReview:${userId}`, rateLimitConfigs.reviewSubmission);
 * Deferred because the existing "one review per product per user" check
 * already provides strong deduplication; rate limiting would add a global
 * daily cap across all products.
 *
 * @param productId - Product ID
 * @param rating - Rating (1-5)
 * @param title - Review title
 * @param content - Review content
 * @returns Created review ID
 */
export const createReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    title: v.optional(v.string()),
    content: v.string(),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Validate rating
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    // Validate content length
    if (args.content.length < 10) {
      throw new Error("Review content must be at least 10 characters");
    }

    if (args.content.length > 5000) {
      throw new Error("Review content must be less than 5000 characters");
    }

    // Check if product exists
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw new Error("Product not found");
    }

    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    // Check if user has purchased this product
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    let isVerifiedPurchase = false;
    let orderId: Id<"orders"> | undefined;

    for (const item of orderItems) {
      const order = await ctx.db.get(item.orderId);
      if (order && order.userId === userId && order.status === "delivered") {
        isVerifiedPurchase = true;
        orderId = order._id;
        break;
      }
    }

    const now = Date.now();

    // Create review
    const reviewId = await ctx.db.insert("reviews", {
      tenantId: args.tenantId ?? product.tenantId,
      productId: args.productId,
      userId,
      orderId,
      rating: args.rating,
      title: args.title,
      content: args.content,
      isVerifiedPurchase,
      helpfulCount: 0,
      isApproved: true, // Auto-approve for now; could require moderation
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update product average rating
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_approved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await ctx.db.patch(args.productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: allReviews.length,
      updatedAt: now,
    });

    return reviewId;
  },
});

/**
 * Update a review
 *
 * @param reviewId - Review ID
 * @param rating - New rating
 * @param title - New title
 * @param content - New content
 * @returns Success boolean
 */
export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review || review.isDeleted) {
      throw new Error("Review not found");
    }

    // Check ownership
    if (review.userId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw new Error("Not authorized to update this review");
      }
    }

    // Validate rating if provided
    if (args.rating !== undefined) {
      if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
        throw new Error("Rating must be an integer between 1 and 5");
      }
    }

    // Validate content if provided
    if (args.content !== undefined) {
      if (args.content.length < 10) {
        throw new Error("Review content must be at least 10 characters");
      }
      if (args.content.length > 5000) {
        throw new Error("Review content must be less than 5000 characters");
      }
    }

    const now = Date.now();

    const { reviewId, ...updates } = args;

    await ctx.db.patch(args.reviewId, {
      ...updates,
      updatedAt: now,
    });

    // Update product average rating if rating changed
    if (args.rating !== undefined && args.rating !== review.rating) {
      const allReviews = await ctx.db
        .query("reviews")
        .withIndex("by_product_approved", (q) =>
          q.eq("productId", review.productId).eq("isApproved", true)
        )
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await ctx.db.patch(review.productId, {
        averageRating: Math.round(averageRating * 10) / 10,
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Delete a review (soft delete)
 *
 * @param reviewId - Review ID
 * @returns Success boolean
 */
export const deleteReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review || review.isDeleted) {
      throw new Error("Review not found");
    }

    // Check ownership or admin
    if (review.userId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin" && profile?.defaultRole !== "moderator") {
        throw new Error("Not authorized to delete this review");
      }
    }

    const now = Date.now();

    await ctx.db.patch(args.reviewId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    // Update product review count and average
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_approved", (q) =>
        q.eq("productId", review.productId).eq("isApproved", true)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await ctx.db.patch(review.productId, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length,
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(review.productId, {
        averageRating: undefined,
        reviewCount: 0,
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Mark a review as helpful
 *
 * @param reviewId - Review ID
 * @returns Success boolean
 */
export const markReviewHelpful = mutation({
  args: {
    reviewId: v.id("reviews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const review = await ctx.db.get(args.reviewId);
    if (!review || review.isDeleted || !review.isApproved) {
      throw new Error("Review not found");
    }

    // Can't mark own review as helpful
    if (review.userId === userId) {
      throw new Error("Cannot mark your own review as helpful");
    }

    // Increment helpful count
    // Note: In production, you'd want to track which users marked which reviews
    // to prevent multiple votes from the same user
    await ctx.db.patch(args.reviewId, {
      helpfulCount: review.helpfulCount + 1,
      updatedAt: Date.now(),
    });

    return true;
  },
});
