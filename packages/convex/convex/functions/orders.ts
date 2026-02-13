import { v } from "convex/values";
import { orderStatusValidator } from "../schema";
import {
  authenticatedMutation,
  authenticatedQuery,
  sellerQuery,
} from "../lib/middleware";
import { createError, ErrorCode } from "../lib/errors";

// Domain modules
import {
  assertCanViewOrder,
  resolveUserRole,
  validateCart,
  calculateOrderTotals,
  buildOrderStatusUpdate,
  restoreInventoryForOrderItems,
  canCancel,
} from "../lib/orders/index";
import {
  getOrderById,
  getOrderItems,
  getPaymentForOrder,
  getOrderByNumber as repoGetOrderByNumber,
  getOrdersByUser,
  getOrderItemsBySeller,
  getUserCart,
  getCartItems,
  createOrderRecord,
  createOrderItems,
  updateOrderStatus as repoUpdateOrderStatus,
  updateOrderItemsStatus,
  clearCart,
  getSellerItemsForOrder,
} from "../lib/orders/index";
import {
  enrichOrderItem,
  toOrderResponse,
  toOrderListItem,
  toSellerOrderView,
} from "../lib/orders/index";

/**
 * Order Management Functions
 *
 * Queries and mutations for managing orders in the Createconomy marketplace.
 * Handlers delegate to domain modules under lib/orders/.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get a single order by ID
 */
export const getOrder = authenticatedQuery({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await getOrderById(ctx, args.orderId);
    if (!order) return null;

    await assertCanViewOrder(ctx, {
      viewerId: ctx.userId,
      orderId: args.orderId,
      orderUserId: order.userId,
    });

    // Fetch items with product details
    const items = await getOrderItems(ctx, args.orderId);

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const primaryImage = product
          ? await ctx.db
              .query("productImages")
              .withIndex("by_product_primary", (q) =>
                q.eq("productId", product._id).eq("isPrimary", true)
              )
              .first()
          : null;

        return enrichOrderItem(item, product, primaryImage);
      })
    );

    const payment = await getPaymentForOrder(ctx, args.orderId);

    return toOrderResponse(order, itemsWithProducts, payment);
  },
});

/**
 * Get order by order number
 */
export const getOrderByNumber = authenticatedQuery({
  args: {
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await repoGetOrderByNumber(ctx, args.orderNumber);
    if (!order) return null;

    if (order.userId !== ctx.userId) {
      const role = await resolveUserRole(ctx, ctx.userId);
      if (role !== "admin") {
        throw createError(ErrorCode.FORBIDDEN, "Not authorized to view this order");
      }
    }

    return order;
  },
});

/**
 * Get user's order history
 */
export const getUserOrders = authenticatedQuery({
  args: {
    status: v.optional(orderStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const orders = await getOrdersByUser(ctx, ctx.userId, args.status, limit);

    const ordersWithItemCount = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(ctx, order._id);
        return toOrderListItem(order, items.length);
      })
    );

    return ordersWithItemCount;
  },
});

/**
 * Get seller's received orders
 */
export const getSellerOrders = sellerQuery({
  args: {
    status: v.optional(orderStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const orderItems = await getOrderItemsBySeller(ctx, ctx.userId, args.status, limit);

    // Get unique orders
    const orderIds = [...new Set(orderItems.map((item) => item.orderId))];

    const orders = await Promise.all(
      orderIds.map(async (orderId) => {
        const order = await getOrderById(ctx, orderId);
        if (!order) return null;

        const sellerItems = orderItems.filter((item) => item.orderId === orderId);
        const buyer = await ctx.db.get(order.userId);

        return toSellerOrderView(order, sellerItems, buyer);
      })
    );

    return orders.filter(Boolean);
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create an order from cart
 *
 * A3 TODO: Add database-backed rate limiting here to prevent order creation
 * abuse. Suggested config: rateLimitConfigs.orderCreation (10 per hour).
 */
export const createOrder = authenticatedMutation({
  args: {
    tenantId: v.optional(v.id("tenants")),
    shippingAddress: v.object({
      name: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.optional(v.string()),
      postalCode: v.string(),
      country: v.string(),
      phone: v.optional(v.string()),
    }),
    billingAddress: v.optional(
      v.object({
        name: v.string(),
        street: v.string(),
        city: v.string(),
        state: v.optional(v.string()),
        postalCode: v.string(),
        country: v.string(),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;

    // Fetch cart
    const cart = await getUserCart(ctx, userId, args.tenantId);
    if (!cart) {
      throw createError(ErrorCode.NOT_FOUND, "Cart not found");
    }

    // Fetch and validate cart items
    const cartItems = await getCartItems(ctx, cart._id);
    const { orderItems, validatedProducts } = await validateCart(ctx, cartItems);

    // Calculate totals
    const totals = calculateOrderTotals(orderItems);

    const now = Date.now();

    // Create the order record
    const { orderId, orderNumber } = await createOrderRecord(ctx, {
      tenantId: args.tenantId,
      userId,
      totals,
      currency: cart.currency,
      shippingAddress: args.shippingAddress,
      billingAddress: args.billingAddress ?? args.shippingAddress,
      notes: args.notes,
      now,
    });

    // Create order items and adjust inventory
    await createOrderItems(ctx, orderId, orderItems, validatedProducts, now);

    // Clear cart
    await clearCart(ctx, cart._id, cartItems, now);

    return { orderId, orderNumber };
  },
});

/**
 * Update order status
 */
export const updateOrderStatus = authenticatedMutation({
  args: {
    orderId: v.id("orders"),
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    const order = await getOrderById(ctx, args.orderId);
    if (!order) {
      throw createError(ErrorCode.NOT_FOUND, "Order not found");
    }

    const role = await resolveUserRole(ctx, ctx.userId);
    const isAdmin = role === "admin";
    const isSeller = role === "seller";

    // Customers can only cancel pending orders
    if (order.userId === ctx.userId && !isAdmin && !isSeller) {
      if (args.status !== "cancelled" || order.status !== "pending") {
        throw createError(
          ErrorCode.ORDER_NOT_MODIFIABLE,
          "Customers can only cancel pending orders"
        );
      }
    }

    // Sellers can update status of their items only
    if (isSeller && !isAdmin) {
      const sellerItems = await getSellerItemsForOrder(ctx, args.orderId, ctx.userId);

      if (sellerItems.length === 0) {
        throw createError(
          ErrorCode.FORBIDDEN,
          "Not authorized to update this order"
        );
      }

      const now = Date.now();
      await updateOrderItemsStatus(ctx, sellerItems, args.status, now);
      return true;
    }

    const now = Date.now();
    const updates = buildOrderStatusUpdate(args.status, now);

    await repoUpdateOrderStatus(ctx, args.orderId, updates);

    // Update all order items status
    const orderItems = await getOrderItems(ctx, args.orderId);
    await updateOrderItemsStatus(ctx, orderItems, args.status, now);

    // If cancelled, restore inventory
    if (args.status === "cancelled") {
      await restoreInventoryForOrderItems(ctx, orderItems);
    }

    return true;
  },
});

/**
 * Cancel an order (customer)
 */
export const cancelOrder = authenticatedMutation({
  args: {
    orderId: v.id("orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await getOrderById(ctx, args.orderId);
    if (!order) {
      throw createError(ErrorCode.NOT_FOUND, "Order not found");
    }

    // Only order owner or admin can cancel
    if (order.userId !== ctx.userId) {
      const role = await resolveUserRole(ctx, ctx.userId);
      if (role !== "admin") {
        throw createError(ErrorCode.FORBIDDEN, "Not authorized to cancel this order");
      }
    }

    if (!canCancel(order.status)) {
      throw createError(
        ErrorCode.ORDER_NOT_MODIFIABLE,
        "Order cannot be cancelled at this stage"
      );
    }

    const now = Date.now();

    await repoUpdateOrderStatus(ctx, args.orderId, {
      status: "cancelled",
      cancelledAt: now,
      notes: args.reason
        ? `${order.notes || ""}\nCancellation reason: ${args.reason}`
        : order.notes,
      updatedAt: now,
    });

    // Update order items and restore inventory
    const orderItems = await getOrderItems(ctx, args.orderId);
    await updateOrderItemsStatus(ctx, orderItems, "cancelled", now);
    await restoreInventoryForOrderItems(ctx, orderItems);

    return true;
  },
});

// ============================================================================
// Seller Dashboard Queries
// ============================================================================

/**
 * Get seller dashboard statistics
 */
export const getSellerDashboardStats = sellerQuery({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const totalRevenue = products.reduce(
      (sum, p) => sum + p.salesCount * p.price,
      0
    );
    const totalViews = products.reduce((sum, p) => sum + (p.viewCount ?? 0), 0);
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);

    const orderItems = await getOrderItemsBySeller(ctx, userId, undefined, 10000);
    const orderCount = new Set(orderItems.map((i) => String(i.orderId))).size;

    return {
      revenue: totalRevenue,
      orders: orderCount,
      products: products.length,
      views: totalViews,
      sales: totalSales,
      activeProducts: products.filter((p) => p.status === "active").length,
      draftProducts: products.filter((p) => p.status === "draft").length,
    };
  },
});

/**
 * Get seller's monthly revenue for charts
 */
export const getSellerMonthlyRevenue = sellerQuery({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    const orderItems = await getOrderItemsBySeller(ctx, userId, undefined, 10000);

    const itemsWithDates = await Promise.all(
      orderItems.map(async (item) => {
        const order = await getOrderById(ctx, item.orderId);
        return order && order.createdAt > oneYearAgo
          ? { subtotal: item.subtotal, createdAt: order.createdAt }
          : null;
      })
    );

    const validItems = itemsWithDates.filter(Boolean) as {
      subtotal: number;
      createdAt: number;
    }[];

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyData: Record<string, { revenue: number; orders: number }> = {};

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { revenue: 0, orders: 0 };
    }

    for (const item of validItems) {
      const d = new Date(item.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key]!.revenue += item.subtotal;
        monthlyData[key]!.orders += 1;
      }
    }

    return Object.entries(monthlyData).map(([key, data]) => {
      const [, month] = key.split("-");
      return {
        name: months[parseInt(month!, 10) - 1],
        revenue: data.revenue,
        orders: data.orders,
      };
    });
  },
});

/**
 * Get reviews for a seller's products
 */
export const getSellerProductReviews = sellerQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const limit = args.limit ?? 20;

    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const productIds = new Set(products.map((p) => String(p._id)));

    const allReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(200);

    const sellerReviews = allReviews
      .filter((r) => productIds.has(String(r.productId)))
      .slice(0, limit);

    const reviewsWithDetails = await Promise.all(
      sellerReviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        const user = (await ctx.db.get(review.userId)) as {
          _id: typeof review.userId;
          name?: string;
          email?: string;
        } | null;

        return {
          ...review,
          product: product
            ? { id: product._id, name: product.name }
            : null,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : null,
        };
      })
    );

    return reviewsWithDetails;
  },
});
