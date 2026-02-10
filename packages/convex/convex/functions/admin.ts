import { query, mutation } from "../_generated/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import { userRoleValidator, orderStatusValidator, productStatusValidator } from "../schema";

/** Order status literal type (mirrors orderStatusValidator) */
type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded"
  | "disputed";

/** Product status literal type (mirrors productStatusValidator) */
type ProductStatus = "draft" | "active" | "inactive" | "archived";

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
async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
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

    // PERF: Use index-based queries per role instead of collecting ALL profiles
    // and filtering in memory. The "by_role" and "by_banned" indexes allow
    // Convex to narrow the scan. Still uses .collect() for counting — should
    // be replaced with pre-computed counters (e.g., a dashboardCounters table
    // updated via mutations) once table sizes justify the extra complexity.
    const [customers, sellers, admins, moderators, bannedProfiles] =
      await Promise.all([
        ctx.db
          .query("userProfiles")
          .withIndex("by_role", (q) => q.eq("defaultRole", "customer"))
          .collect(),
        ctx.db
          .query("userProfiles")
          .withIndex("by_role", (q) => q.eq("defaultRole", "seller"))
          .collect(),
        ctx.db
          .query("userProfiles")
          .withIndex("by_role", (q) => q.eq("defaultRole", "admin"))
          .collect(),
        ctx.db
          .query("userProfiles")
          .withIndex("by_role", (q) => q.eq("defaultRole", "moderator"))
          .collect(),
        ctx.db
          .query("userProfiles")
          .withIndex("by_banned", (q) => q.eq("isBanned", true))
          .collect(),
      ]);

    const userStats = {
      total: customers.length + sellers.length + admins.length + moderators.length,
      customers: customers.length,
      sellers: sellers.length,
      admins: admins.length,
      moderators: moderators.length,
      banned: bannedProfiles.length,
    };

    // PERF: Use index-based queries per order status instead of collecting ALL
    // orders then filtering in memory. Each query uses "by_status" (or
    // "by_tenant_status") so Convex only scans matching rows.
    const ordersByStatus = async (status: OrderStatus) => {
      if (args.tenantId) {
        return ctx.db
          .query("orders")
          .withIndex("by_tenant_status", (q) =>
            q.eq("tenantId", args.tenantId).eq("status", status)
          )
          .collect();
      }
      return ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    };

    const [
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      ordersByStatus("pending"),
      ordersByStatus("confirmed"),
      ordersByStatus("processing"),
      ordersByStatus("shipped"),
      ordersByStatus("delivered"),
      ordersByStatus("cancelled"),
    ]);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // PERF: For time-range counts we still need a scan. Ideally add a
    // "by_createdAt" index and use range queries, or pre-compute counters.
    // For now, collect recent orders (desc) and filter in memory.
    const recentOrdersCap = args.tenantId
      ? await ctx.db
          .query("orders")
          .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
          .order("desc")
          .collect()
      : await ctx.db.query("orders").order("desc").collect();

    const recentOrdersLastMonth = recentOrdersCap.filter(
      (o) => o.createdAt > oneMonthAgo
    );

    const allOrders = [
      ...pendingOrders,
      ...confirmedOrders,
      ...processingOrders,
      ...shippedOrders,
      ...deliveredOrders,
      ...cancelledOrders,
    ];

    const orderStats = {
      total: allOrders.length,
      pending: pendingOrders.length,
      confirmed: confirmedOrders.length,
      processing: processingOrders.length,
      shipped: shippedOrders.length,
      delivered: deliveredOrders.length,
      cancelled: cancelledOrders.length,
      last24Hours: recentOrdersLastMonth.filter(
        (o) => o.createdAt > oneDayAgo
      ).length,
      lastWeek: recentOrdersLastMonth.filter(
        (o) => o.createdAt > oneWeekAgo
      ).length,
      lastMonth: recentOrdersLastMonth.length,
    };

    // PERF: Revenue only needs shipped + delivered orders. We already have
    // those from the index-based queries above — no extra full-table scan.
    const completedOrders = [...shippedOrders, ...deliveredOrders];
    const revenueStats = {
      total: completedOrders.reduce((sum: number, o) => sum + o.total, 0),
      last24Hours: completedOrders
        .filter((o) => o.createdAt > oneDayAgo)
        .reduce((sum: number, o) => sum + o.total, 0),
      lastWeek: completedOrders
        .filter((o) => o.createdAt > oneWeekAgo)
        .reduce((sum: number, o) => sum + o.total, 0),
      lastMonth: completedOrders
        .filter((o) => o.createdAt > oneMonthAgo)
        .reduce((sum: number, o) => sum + o.total, 0),
    };

    // PERF: Use index-based queries per product status instead of collecting
    // ALL products then filtering. Uses "by_tenant_status" or "by_status" and
    // "by_deleted" indexes to narrow each scan.
    const productsByStatus = async (status: ProductStatus) => {
      if (args.tenantId) {
        return ctx.db
          .query("products")
          .withIndex("by_tenant_status", (q) =>
            q.eq("tenantId", args.tenantId).eq("status", status)
          )
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect();
      }
      return ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", status))
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .collect();
    };

    const deletedProducts = args.tenantId
      ? await ctx.db
          .query("products")
          .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
          .filter((q) => q.eq(q.field("isDeleted"), true))
          .collect()
      : await ctx.db
          .query("products")
          .withIndex("by_deleted", (q) => q.eq("isDeleted", true))
          .collect();

    const [activeProducts, draftProducts, inactiveProducts] = await Promise.all(
      [
        productsByStatus("active"),
        productsByStatus("draft"),
        productsByStatus("inactive"),
      ]
    );

    const productStats = {
      total:
        activeProducts.length +
        draftProducts.length +
        inactiveProducts.length +
        deletedProducts.length,
      active: activeProducts.length,
      draft: draftProducts.length,
      inactive: inactiveProducts.length,
      deleted: deletedProducts.length,
    };

    // PERF: Use "by_deleted" index to only scan non-deleted threads/posts
    // instead of collecting ALL records and filtering in memory.
    const [activeThreads, activePosts] = await Promise.all([
      ctx.db
        .query("forumThreads")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", false))
        .collect(),
      ctx.db
        .query("forumPosts")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", false))
        .collect(),
    ]);

    const forumStats = {
      threads: activeThreads.length,
      posts: activePosts.length,
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
      (o) => o.createdAt > oneHourAgo
    ).length;

    const recentSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires", (q) => q.gt("expiresAt", now))
      .collect();

    const activeSessions = recentSessions.filter((s) => s.isActive).length;

    // Get webhook event stats
    const recentWebhooks = await ctx.db
      .query("stripeWebhookEvents")
      .order("desc")
      .take(100);

    const failedWebhooks = recentWebhooks.filter(
      (w) => w.processed && w.error
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

    if (args.role !== undefined) {
      const role = args.role;
      profilesQuery = ctx.db
        .query("userProfiles")
        .withIndex("by_role", (q) => q.eq("defaultRole", role));
    } else if (args.isBanned !== undefined) {
      const isBanned = args.isBanned;
      profilesQuery = ctx.db
        .query("userProfiles")
        .withIndex("by_banned", (q) => q.eq("isBanned", isBanned));
    } else {
      profilesQuery = ctx.db.query("userProfiles");
    }

    const profiles = await profilesQuery.order("desc").take(limit + 1);

    const hasMore = profiles.length > limit;
    const items = hasMore ? profiles.slice(0, limit) : profiles;

    // Get user details for each profile
    const usersWithProfiles = await Promise.all(
      items.map(async (profile) => {
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
      nextCursor: hasMore ? items[items.length - 1]?._id ?? null : null,
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
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
// Seller Management
// ============================================================================

/**
 * List pending seller applications
 *
 * BUG FIX B6: Added to support the seller approval workflow.
 * Lists seller records that have not yet been approved.
 *
 * @param limit - Number of sellers to return
 * @returns List of pending seller applications with user details
 */
export const listPendingSellers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    const pendingSellers = await ctx.db
      .query("sellers")
      .withIndex("by_approved", (q) => q.eq("isApproved", false))
      .order("desc")
      .take(limit);

    // Get user details for each seller
    const sellersWithDetails = await Promise.all(
      pendingSellers.map(async (seller) => {
        const user = await ctx.db.get(seller.userId) as {
          _id: Id<"users">;
          email?: string;
          name?: string;
        } | null;

        return {
          ...seller,
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

    return sellersWithDetails;
  },
});

/**
 * Approve or reject a seller application
 *
 * BUG FIX B6: Completes the seller approval workflow introduced by the
 * updated requestSellerRole mutation. When approved, sets the seller record
 * to approved/active and upgrades the user's profile role to "seller".
 * When rejected, removes the seller record.
 *
 * @param sellerId - Seller record ID
 * @param approved - Whether to approve or reject
 * @returns Success boolean
 */
export const approveSeller = mutation({
  args: {
    sellerId: v.id("sellers"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const seller = await ctx.db.get(args.sellerId);
    if (!seller) {
      throw new Error("Seller application not found");
    }

    if (seller.isApproved) {
      throw new Error("Seller is already approved");
    }

    const now = Date.now();

    if (args.approved) {
      // Approve the seller record
      await ctx.db.patch(args.sellerId, {
        isApproved: true,
        approvedAt: now,
        isActive: true,
        updatedAt: now,
      });

      // Upgrade the user's profile role to "seller"
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", seller.userId))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, {
          defaultRole: "seller",
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("userProfiles", {
          userId: seller.userId,
          defaultRole: "seller",
          isBanned: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    } else {
      // Reject: remove the seller record so the user can re-apply later
      await ctx.db.delete(args.sellerId);
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
      const tenantId = args.tenantId;
      const status = args.status;
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_tenant_status", (q) =>
          q.eq("tenantId", tenantId).eq("status", status)
        );
    } else if (args.status) {
      const status = args.status;
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", status));
    } else if (args.tenantId) {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    } else {
      ordersQuery = ctx.db.query("orders");
    }

    const orders = await ordersQuery.order("desc").take(limit + 1);

    const hasMore = orders.length > limit;
    const items = hasMore ? orders.slice(0, limit) : orders;

    // Get user info for each order
    const ordersWithUsers = await Promise.all(
      items.map(async (order) => {
        const user = await ctx.db.get(order.userId) as { _id: Id<"users">; email?: string; name?: string } | null;

        const itemCount = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
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
      nextCursor: hasMore ? items[items.length - 1]?._id ?? null : null,
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
    const updates: Partial<Doc<"orders">> = {
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
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
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
// Single-Record Queries
// ============================================================================

/**
 * Get a user by ID with full profile
 *
 * @param userId - User ID
 * @returns User details with profile, orders, and activity
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const user = (await ctx.db.get(args.userId)) as {
      _id: Id<"users">;
      email?: string;
      name?: string;
      image?: string;
    } | null;

    if (!user) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get user's orders
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    // Get seller record if any
    const seller = await ctx.db
      .query("sellers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      profile: profile
        ? {
            displayName: profile.displayName,
            username: profile.username,
            bio: profile.bio,
            role: profile.defaultRole,
            isBanned: profile.isBanned,
            bannedAt: profile.bannedAt,
            bannedReason: profile.bannedReason,
            points: profile.points,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        : null,
      orders: orders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
      seller: seller
        ? {
            id: seller._id,
            businessName: seller.businessName,
            isApproved: seller.isApproved,
            isActive: seller.isActive,
          }
        : null,
    };
  },
});

/**
 * Get a single order by ID with items
 *
 * @param orderId - Order ID
 * @returns Full order with items, user, and payment details
 */
export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const user = (await ctx.db.get(order.userId)) as {
      _id: Id<"users">;
      email?: string;
      name?: string;
    } | null;

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Get product & seller details for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = (await ctx.db.get(item.productId)) as {
          _id: Id<"products">;
          name: string;
          slug: string;
        } | null;
        const seller = (await ctx.db.get(item.sellerId)) as {
          _id: Id<"users">;
          name?: string;
        } | null;
        return {
          ...item,
          productName: product?.name ?? "Unknown Product",
          productSlug: product?.slug,
          sellerName: seller?.name ?? "Unknown Seller",
        };
      })
    );

    // Get payment record
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    return {
      ...order,
      user: user
        ? { id: user._id, name: user.name, email: user.email }
        : null,
      items: itemsWithDetails,
      payment: payment
        ? {
            id: payment._id,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            receiptUrl: payment.receiptUrl,
            createdAt: payment.createdAt,
          }
        : null,
    };
  },
});

/**
 * Get a single product by ID with full details
 *
 * @param productId - Product ID
 * @returns Product with seller info, images, and stats
 */
export const getProductById = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product) return null;

    const seller = (await ctx.db.get(product.sellerId)) as {
      _id: Id<"users">;
      name?: string;
      email?: string;
    } | null;

    const category = product.categoryId
      ? await ctx.db.get(product.categoryId)
      : null;

    const images = await ctx.db
      .query("productImages")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    return {
      ...product,
      seller: seller
        ? { id: seller._id, name: seller.name, email: seller.email }
        : null,
      category: category
        ? { id: category._id, name: category.name, slug: category.slug }
        : null,
      images: images.map((img) => ({
        id: img._id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
    };
  },
});

/**
 * List all products with pagination (admin view)
 *
 * @param limit - Number per page
 * @param status - Filter by status
 * @returns Paginated product list
 */
export const listAllProducts = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(productStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    let productsQuery;
    if (args.status) {
      const status = args.status;
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", status))
        .filter((q) => q.eq(q.field("isDeleted"), false));
    } else {
      productsQuery = ctx.db
        .query("products")
        .filter((q) => q.eq(q.field("isDeleted"), false));
    }

    const products = await productsQuery.order("desc").take(limit + 1);
    const hasMore = products.length > limit;
    const items = hasMore ? products.slice(0, limit) : products;

    const productsWithDetails = await Promise.all(
      items.map(async (product) => {
        const seller = (await ctx.db.get(product.sellerId)) as {
          _id: Id<"users">;
          name?: string;
        } | null;
        const category = product.categoryId
          ? await ctx.db.get(product.categoryId)
          : null;
        return {
          id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          status: product.status,
          salesCount: product.salesCount,
          viewCount: product.viewCount,
          reviewCount: product.reviewCount,
          averageRating: product.averageRating,
          createdAt: product.createdAt,
          seller: seller ? { id: seller._id, name: seller.name } : null,
          category: category
            ? { id: category._id, name: category.name }
            : null,
        };
      })
    );

    return {
      items: productsWithDetails,
      hasMore,
    };
  },
});

/**
 * List all sellers with pagination (admin view)
 *
 * @param limit - Number per page
 * @returns Paginated seller list with user details
 */
export const listAllSellers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 20;

    const sellers = await ctx.db
      .query("sellers")
      .order("desc")
      .take(limit + 1);

    const hasMore = sellers.length > limit;
    const items = hasMore ? sellers.slice(0, limit) : sellers;

    const sellersWithDetails = await Promise.all(
      items.map(async (seller) => {
        const user = (await ctx.db.get(seller.userId)) as {
          _id: Id<"users">;
          email?: string;
          name?: string;
        } | null;

        // Count products for this seller
        const products = await ctx.db
          .query("products")
          .withIndex("by_seller", (q) => q.eq("sellerId", seller.userId))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect();

        return {
          id: seller._id,
          userId: seller.userId,
          businessName: seller.businessName,
          description: seller.description,
          isApproved: seller.isApproved,
          isActive: seller.isActive,
          stripeOnboarded: seller.stripeOnboarded,
          totalSales: seller.totalSales ?? 0,
          totalRevenue: seller.totalRevenue ?? 0,
          productCount: products.length,
          createdAt: seller.createdAt,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : null,
        };
      })
    );

    return {
      items: sellersWithDetails,
      hasMore,
    };
  },
});

/**
 * Get a seller by ID with full details
 *
 * @param sellerId - Seller record ID
 * @returns Seller with user info, products, and orders
 */
export const getSellerById = query({
  args: {
    sellerId: v.id("sellers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const seller = await ctx.db.get(args.sellerId);
    if (!seller) return null;

    const user = (await ctx.db.get(seller.userId)) as {
      _id: Id<"users">;
      email?: string;
      name?: string;
      image?: string;
    } | null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", seller.userId))
      .first();

    // Get seller's products
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(10);

    // Get seller's recent orders (via order items)
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller.userId))
      .order("desc")
      .take(10);

    const recentOrders = await Promise.all(
      orderItems.map(async (item) => {
        const order = await ctx.db.get(item.orderId);
        const buyer = order
          ? ((await ctx.db.get(order.userId)) as {
              _id: Id<"users">;
              name?: string;
            } | null)
          : null;
        return order
          ? {
              id: order._id,
              orderNumber: order.orderNumber,
              productName: item.name,
              total: item.subtotal,
              status: order.status,
              buyerName: buyer?.name,
              createdAt: order.createdAt,
            }
          : null;
      })
    );

    // Get Stripe connect account
    const connectAccount = await ctx.db
      .query("stripeConnectAccounts")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .first();

    return {
      ...seller,
      user: user
        ? { id: user._id, name: user.name, email: user.email, image: user.image }
        : null,
      profile: profile
        ? { displayName: profile.displayName, bio: profile.bio }
        : null,
      products: products.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        status: p.status,
        salesCount: p.salesCount,
      })),
      recentOrders: recentOrders.filter(Boolean),
      connectAccount: connectAccount
        ? {
            chargesEnabled: connectAccount.chargesEnabled,
            payoutsEnabled: connectAccount.payoutsEnabled,
            onboardingComplete: connectAccount.onboardingComplete,
          }
        : null,
    };
  },
});

/**
 * Get monthly revenue data for charts
 *
 * @returns Array of { month, year, revenue, orderCount } for last 12 months
 */
export const getMonthlyRevenue = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    // Get completed orders from the last 12 months
    const completedStatuses: OrderStatus[] = ["shipped", "delivered"];
    const allCompletedOrders: Doc<"orders">[] = [];

    for (const status of completedStatuses) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      allCompletedOrders.push(
        ...orders.filter((o) => o.createdAt > oneYearAgo)
      );
    }

    // Group by month
    const monthlyData: Record<
      string,
      { revenue: number; orderCount: number }
    > = {};

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { revenue: 0, orderCount: 0 };
    }

    for (const order of allCompletedOrders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key]!.revenue += order.total;
        monthlyData[key]!.orderCount += 1;
      }
    }

    return Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split("-");
      return {
        name: months[parseInt(month!, 10) - 1],
        year: parseInt(year!, 10),
        revenue: data.revenue,
        orders: data.orderCount,
      };
    });
  },
});

/**
 * Get recent orders for dashboard widget
 *
 * @param limit - Number of orders
 * @returns Recent orders with user and product info
 */
export const getRecentOrders = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const limit = args.limit ?? 5;

    const orders = await ctx.db.query("orders").order("desc").take(limit);

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const user = (await ctx.db.get(order.userId)) as {
          _id: Id<"users">;
          name?: string;
          email?: string;
        } | null;

        // Get first item name
        const firstItem = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .first();

        return {
          id: order._id,
          orderNumber: order.orderNumber,
          customer: user?.name ?? user?.email ?? "Unknown",
          productName: firstItem?.name ?? "N/A",
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
        };
      })
    );

    return ordersWithDetails;
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
      .filter((q) =>
        q.and(
          q.eq(q.field("isApproved"), false),
          q.eq(q.field("isDeleted"), false)
        )
      )
      .order("desc")
      .take(limit);

    // Get product and user info
    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
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

      // BUG FIX B4: Compute new average rating mathematically instead of
      // re-querying ALL approved reviews (O(n) and gets worse over time).
      // Formula: newAvg = (oldAvg * oldCount + newRating) / (oldCount + 1)
      const product = await ctx.db.get(review.productId);
      if (product) {
        const oldAvg = product.averageRating ?? 0;
        const oldCount = product.reviewCount ?? 0;
        const newCount = oldCount + 1;
        const newAvg = (oldAvg * oldCount + review.rating) / newCount;

        await ctx.db.patch(review.productId, {
          averageRating: Math.round(newAvg * 100) / 100, // Round to 2 decimals
          reviewCount: newCount,
          updatedAt: now,
        });
      }
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
      .withIndex("by_status", (q) => q.eq("status", "hidden"))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(limit);

    // Get thread and user info
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
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

// ============================================================================
// Platform Settings
// ============================================================================

/**
 * Get platform settings
 *
 * Reads settings from the first (default) tenant record, which serves
 * as the platform-level configuration store.
 *
 * @returns Platform settings or empty defaults
 */
export const getPlatformSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Use the first tenant as the "default" platform
    const tenant = await ctx.db.query("tenants").first();

    if (!tenant) {
      return {
        platformName: "Createconomy",
        supportEmail: "",
        description: "",
        currency: "USD",
        theme: undefined as string | undefined,
        logo: undefined as string | undefined,
        primaryColor: undefined as string | undefined,
        timezone: undefined as string | undefined,
        isActive: true,
      };
    }

    return {
      id: tenant._id,
      platformName: tenant.name,
      slug: tenant.slug,
      domain: tenant.domain,
      subdomain: tenant.subdomain,
      currency: tenant.settings?.currency ?? "USD",
      theme: tenant.settings?.theme,
      logo: tenant.settings?.logo,
      primaryColor: tenant.settings?.primaryColor,
      timezone: tenant.settings?.timezone,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
    };
  },
});

/**
 * Update platform settings
 *
 * Updates the default tenant record with new platform configuration.
 * Creates a tenant record if none exists.
 *
 * @param platformName - Platform display name
 * @param currency - Default currency code
 * @param theme - Theme name
 * @param primaryColor - Brand color
 * @param timezone - Default timezone
 * @returns Success boolean
 */
export const updatePlatformSettings = mutation({
  args: {
    platformName: v.optional(v.string()),
    currency: v.optional(v.string()),
    theme: v.optional(v.string()),
    logo: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const tenant = await ctx.db.query("tenants").first();

    if (tenant) {
      const existingSettings = tenant.settings ?? {};
      await ctx.db.patch(tenant._id, {
        ...(args.platformName !== undefined && { name: args.platformName }),
        settings: {
          ...existingSettings,
          ...(args.currency !== undefined && { currency: args.currency }),
          ...(args.theme !== undefined && { theme: args.theme }),
          ...(args.logo !== undefined && { logo: args.logo }),
          ...(args.primaryColor !== undefined && { primaryColor: args.primaryColor }),
          ...(args.timezone !== undefined && { timezone: args.timezone }),
        },
        updatedAt: now,
      });
    } else {
      // Create default tenant if none exists
      await ctx.db.insert("tenants", {
        name: args.platformName ?? "Createconomy",
        slug: "default",
        settings: {
          currency: args.currency ?? "USD",
          theme: args.theme,
          logo: args.logo,
          primaryColor: args.primaryColor,
          timezone: args.timezone,
        },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});
