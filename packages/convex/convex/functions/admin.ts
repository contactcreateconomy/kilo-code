import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";
import { userRoleValidator, orderStatusValidator } from "../schema";

/**
 * Admin Management Functions
 *
 * Queries and mutations for administrative tasks
 * in the Createconomy platform.
 *
 * All functions require admin role unless otherwise specified.
 */

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify the current user is an admin
 */
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile || profile.defaultRole !== "admin") {
    throw new Error("Admin role required");
  }

  return userId;
}

// ============================================================================
// Dashboard Queries
// ============================================================================

/**
 * Get dashboard statistics
 *
 * @returns Dashboard statistics including user counts, order stats, revenue
 */
export const getDashboardStats = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get user counts
    const allProfiles = await ctx.db.query("userProfiles").collect();
    const userStats = {
      total: allProfiles.length,
      customers: allProfiles.filter((p: any) => p.defaultRole === "customer").length,
      sellers: allProfiles.filter((p: any) => p.defaultRole === "seller").length,
      admins: allProfiles.filter((p: any) => p.defaultRole === "admin").length,
      moderators: allProfiles.filter((p: any) => p.defaultRole === "moderator").length,
      banned: allProfiles.filter((p: any) => p.isBanned).length,
    };

    // Get order stats
    const allOrders = args.tenantId
      ? await ctx.db
          .query("orders")
          .withIndex("by_tenant", (q: any) => q.eq("tenantId", args.tenantId))
          .collect()
      : await ctx.db.query("orders").collect();

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const orderStats = {
      total: allOrders.length,
      pending: allOrders.filter((o: any) => o.status === "pending").length,
      confirmed: allOrders.filter((o: any) => o.status === "confirmed").length,
      processing: allOrders.filter((o: any) => o.status === "processing").length,
      shipped: allOrders.filter((o: any) => o.status === "shipped").length,
      delivered: allOrders.filter((o: any) => o.status === "delivered").length,
      cancelled: allOrders.filter((o: any) => o.status === "cancelled").length,
      last24Hours: allOrders.filter((o: any) => o.createdAt > oneDayAgo).length,
      lastWeek: allOrders.filter((o: any) => o.createdAt > oneWeekAgo).length,
      lastMonth: allOrders.filter((o: any) => o.createdAt > oneMonthAgo).length,
    };

    // Calculate revenue
    const completedOrders = allOrders.filter(
      (o: any) => o.status === "delivered" || o.status === "shipped"
    );
    const revenueStats = {
      total: completedOrders.reduce((sum: number, o: any) => sum + o.total, 0),
      last24Hours: completedOrders
        .filter((o: any) => o.createdAt > oneDayAgo)
        .reduce((sum: number, o: any) => sum + o.total, 0),
      lastWeek: completedOrders
        .filter((o: any) => o.createdAt > oneWeekAgo)
        .reduce((sum: number, o: any) => sum + o.total, 0),
      lastMonth: completedOrders
        .filter((o: any) => o.createdAt > oneMonthAgo)
        .reduce((sum: number, o: any) => sum + o.total, 0),
    };

    // Get product stats
    const allProducts = args.tenantId
      ? await ctx.db
          .query("products")
          .withIndex("by_tenant", (q: any) => q.eq("tenantId", args.tenantId))
          .collect()
      : await ctx.db.query("products").collect();

    const productStats = {
      total: allProducts.length,
      active: allProducts.filter((p: any) => p.status === "active" && !p.isDeleted).length,
      draft: allProducts.filter((p: any) => p.status === "draft" && !p.isDeleted).length,
      inactive: allProducts.filter((p: any) => p.status === "inactive" && !p.isDeleted).length,
      deleted: allProducts.filter((p: any) => p.isDeleted).length,
    };

    // Get forum stats
    const allThreads = await ctx.db.query("forumThreads").collect();
    const allPosts = await ctx.db.query("forumPosts").collect();

    const forumStats = {
      threads: allThreads.filter((t: any) => !t.isDeleted).length,
      posts: allPosts.filter((p: any) => !p.isDeleted).length,
    };

    return {
      users: userStats,
      orders: orderStats,
      revenue: revenueStats,
      products: productStats,
      forum: forumStats,
      generatedAt: now,
    };
  },
});

/**
 * Get system health metrics
 *
 * @returns System health information
 */
export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get recent activity
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentOrders = await ctx.db
      .query("orders")
      .order("desc")
      .take(100);

    const recentOrdersLastHour = recentOrders.filter(
      (o: any) => o.createdAt > oneHourAgo
    ).length;

    const recentSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires", (q: any) => q.gt("expiresAt", now))
      .collect();

    const activeSessions = recentSessions.filter((s: any) => s.isActive).length;

    // Get webhook event stats
    const recentWebhooks = await ctx.db
      .query("stripeWebhookEvents")
      .order("desc")
      .take(100);

    const failedWebhooks = recentWebhooks.filter(
      (w: any) => w.processed && w.error
    ).length;

    return {
      status: "healthy",
      metrics: {
        activeSessionCount: activeSessions,
        ordersLastHour: recentOrdersLastHour,
        webhookErrorsRecent: failedWebhooks,
      },
      timestamp: now,
    };
  },
});

// ============================================================================
// User Management
// ============================================================================

/**
 * List all users with pagination
 *
 * @param limit - Number of users per page
 * @param cursor - Pagination cursor
 * @param role - Filter by role
 * @param isBanned - Filter by banned status
 * @returns Paginated list of users
 */
export const listAllUsers = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    role: v.optional(userRoleValidator),
    isBanned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    let profilesQuery;

    if (args.role) {
      profilesQuery = ctx.db
        .query("userProfiles")
        .withIndex("by_role", (q: any) => q.eq("defaultRole", args.role));
    } else if (args.isBanned !== undefined) {
      profilesQuery = ctx.db
        .query("userProfiles")
        .withIndex("by_banned", (q: any) => q.eq("isBanned", args.isBanned));
    } else {
      profilesQuery = ctx.db.query("userProfiles");
    }

    const profiles = await profilesQuery.order("desc").take(limit + 1);

    const hasMore = profiles.length > limit;
    const items = hasMore ? profiles.slice(0, limit) : profiles;

    // Get user details for each profile
    const usersWithProfiles = await Promise.all(
      items.map(async (profile: any) => {
        const user = await ctx.db.get(profile.userId) as { _id: Id<"users">; email?: string; name?: string; image?: string } | null;

        return {
          id: profile.userId,
          email: user?.email,
          name: user?.name,
          image: user?.image,
          profile: {
            displayName: profile.displayName,
            role: profile.defaultRole,
            isBanned: profile.isBanned,
            bannedAt: profile.bannedAt,
            bannedReason: profile.bannedReason,
            createdAt: profile.createdAt,
          },
        };
      })
    );

    return {
      items: usersWithProfiles,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});

/**
 * Update user status (ban/unban)
 *
 * @param userId - User ID
 * @param isBanned - Ban status
 * @param reason - Ban reason
 * @returns Success boolean
 */
export const updateUserStatus = mutation({
  args: {
    userId: v.id("users"),
    isBanned: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);

    // Can't ban yourself
    if (args.userId === adminId) {
      throw new Error("Cannot modify your own status");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const now = Date.now();

    await ctx.db.patch(profile._id, {
      isBanned: args.isBanned,
      bannedAt: args.isBanned ? now : undefined,
      bannedReason: args.isBanned ? args.reason : undefined,
      updatedAt: now,
    });

    // If banning, invalidate all sessions
    if (args.isBanned) {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
        .collect();

      for (const session of sessions) {
        await ctx.db.patch(session._id, {
          isActive: false,
        });
      }
    }

    return true;
  },
});

/**
 * Change user role
 *
 * @param userId - User ID
 * @param role - New role
 * @returns Success boolean
 */
export const changeUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);

    // Can't change your own role
    if (args.userId === adminId) {
      throw new Error("Cannot modify your own role");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (profile) {
      await ctx.db.patch(profile._id, {
        defaultRole: args.role,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        defaultRole: args.role,
        isBanned: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

// ============================================================================
// Order Management
// ============================================================================

/**
 * List all orders with pagination
 *
 * @param limit - Number of orders per page
 * @param status - Filter by status
 * @param tenantId - Filter by tenant
 * @returns Paginated list of orders
 */
export const listAllOrders = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(orderStatusValidator),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    let ordersQuery;

    if (args.tenantId && args.status) {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_tenant_status", (q: any) =>
          q.eq("tenantId", args.tenantId).eq("status", args.status)
        );
    } else if (args.status) {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_status", (q: any) => q.eq("status", args.status));
    } else if (args.tenantId) {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_tenant", (q: any) => q.eq("tenantId", args.tenantId));
    } else {
      ordersQuery = ctx.db.query("orders");
    }

    const orders = await ordersQuery.order("desc").take(limit + 1);

    const hasMore = orders.length > limit;
    const items = hasMore ? orders.slice(0, limit) : orders;

    // Get user info for each order
    const ordersWithUsers = await Promise.all(
      items.map(async (order: any) => {
        const user = await ctx.db.get(order.userId) as { _id: Id<"users">; email?: string; name?: string } | null;

        const itemCount = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q: any) => q.eq("orderId", order._id))
          .collect();

        return {
          ...order,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,
          itemCount: itemCount.length,
        };
      })
    );

    return {
      items: ordersWithUsers,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});

/**
 * Force update order status (admin override)
 *
 * @param orderId - Order ID
 * @param status - New status
 * @returns Success boolean
 */
export const forceUpdateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: orderStatusValidator,
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const now = Date.now();
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: now,
    };

    // Set timestamp based on status
    switch (args.status) {
      case "confirmed":
        updates.paidAt = updates.paidAt ?? now;
        break;
      case "shipped":
        updates.shippedAt = now;
        break;
      case "delivered":
        updates.deliveredAt = now;
        break;
      case "cancelled":
        updates.cancelledAt = now;
        break;
    }

    if (args.notes) {
      updates.notes = order.notes
        ? `${order.notes}\n[Admin] ${args.notes}`
        : `[Admin] ${args.notes}`;
    }

    await ctx.db.patch(args.orderId, updates);

    // Update all order items
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q: any) => q.eq("orderId", args.orderId))
      .collect();

    for (const item of orderItems) {
      await ctx.db.patch(item._id, {
        status: args.status,
        updatedAt: now,
      });
    }

    return true;
  },
});

// ============================================================================
// Content Moderation
// ============================================================================

/**
 * List pending reviews for moderation
 *
 * @param limit - Number of reviews to return
 * @returns List of pending reviews
 */
export const listPendingReviews = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    const reviews = await ctx.db
      .query("reviews")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("isApproved"), false),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .order("desc")
      .take(limit);

    // Get product and user info
    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review: any) => {
        const product = await ctx.db.get(review.productId) as { _id: Id<"products">; name: string } | null;
        const user = await ctx.db.get(review.userId) as { _id: Id<"users">; email?: string; name?: string } | null;

        return {
          ...review,
          product: product
            ? {
                id: product._id,
                name: product.name,
              }
            : null,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,
        };
      })
    );

    return reviewsWithDetails;
  },
});

/**
 * Approve or reject a review
 *
 * @param reviewId - Review ID
 * @param approved - Approval status
 * @returns Success boolean
 */
export const moderateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    const now = Date.now();

    if (args.approved) {
      await ctx.db.patch(args.reviewId, {
        isApproved: true,
        updatedAt: now,
      });

      // Update product rating
      const allReviews = await ctx.db
        .query("reviews")
        .withIndex("by_product_approved", (q: any) =>
          q.eq("productId", review.productId).eq("isApproved", true)
        )
        .filter((q: any) => q.eq(q.field("isDeleted"), false))
        .collect();

      const totalRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await ctx.db.patch(review.productId, {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: allReviews.length,
        updatedAt: now,
      });
    } else {
      // Soft delete rejected review
      await ctx.db.patch(args.reviewId, {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * List reported forum posts
 *
 * @param limit - Number of posts to return
 * @returns List of hidden/reported posts
 */
export const listReportedPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_status", (q: any) => q.eq("status", "hidden"))
      .filter((q: any) => q.eq(q.field("isDeleted"), false))
      .take(limit);

    // Get thread and user info
    const postsWithDetails = await Promise.all(
      posts.map(async (post: any) => {
        const thread = await ctx.db.get(post.threadId) as { _id: Id<"forumThreads">; title: string } | null;
        const user = await ctx.db.get(post.authorId) as { _id: Id<"users">; email?: string; name?: string } | null;

        return {
          ...post,
          thread: thread
            ? {
                id: thread._id,
                title: thread.title,
              }
            : null,
          author: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
              }
            : null,
        };
      })
    );

    return postsWithDetails;
  },
});

/**
 * Moderate a forum post
 *
 * @param postId - Post ID
 * @param action - Action to take (approve, delete)
 * @returns Success boolean
 */
export const moderatePost = mutation({
  args: {
    postId: v.id("forumPosts"),
    action: v.union(v.literal("approve"), v.literal("delete")),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const now = Date.now();

    if (args.action === "approve") {
      await ctx.db.patch(args.postId, {
        status: "published",
        updatedAt: now,
      });
    } else {
      await ctx.db.patch(args.postId, {
        isDeleted: true,
        deletedAt: now,
        deletedBy: adminId,
        updatedAt: now,
      });

      // Update thread post count
      const thread = await ctx.db.get(post.threadId);
      if (thread) {
        await ctx.db.patch(post.threadId, {
          postCount: Math.max(1, thread.postCount - 1),
          updatedAt: now,
        });
      }
    }

    return true;
  },
});
