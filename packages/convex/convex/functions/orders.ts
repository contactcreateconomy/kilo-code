import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { orderStatusValidator } from "../schema";
import { generateOrderNumber } from "../lib/orderUtils";
import {
  authenticatedMutation,
  authenticatedQuery,
  sellerQuery,
} from "../lib/middleware";
import { createError, ErrorCode } from "../lib/errors";
import {
  assertCanViewOrder,
  buildOrderStatusUpdate,
  resolveUserRole,
  restoreInventoryForOrderItems,
} from "../lib/orders";

/**
 * Order Management Functions
 *
 * Queries and mutations for managing orders in the Createconomy marketplace.
 * Includes creating orders, viewing order history, and updating order status.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get a single order by ID
 *
 * @param orderId - Order ID
 * @returns Order with items or null
 */
export const getOrder = authenticatedQuery({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return null;
    }

    await assertCanViewOrder(ctx, {
      viewerId: ctx.userId,
      orderId: args.orderId,
      orderUserId: order.userId,
    });

    // Get order items
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Get product details for each item
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

        return {
          ...item,
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

    // Get payment info
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    return {
      ...order,
      items: itemsWithProducts,
      payment: payment
        ? {
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            paidAt: payment.status === "succeeded" ? payment.updatedAt : null,
          }
        : null,
    };
  },
});

/**
 * Get order by order number
 *
 * @param orderNumber - Order number
 * @returns Order or null
 */
export const getOrderByNumber = authenticatedQuery({
  args: {
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", args.orderNumber))
      .first();

    if (!order) {
      return null;
    }

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
 *
 * @param status - Optional status filter
 * @param limit - Number of orders to return
 * @returns List of user's orders
 */
export const getUserOrders = authenticatedQuery({
  args: {
    status: v.optional(orderStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let ordersQuery;

    if (args.status) {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", ctx.userId).eq("status", args.status!)
        );
    } else {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", ctx.userId));
    }

    const orders = await ordersQuery.order("desc").take(limit);

    // Get item count for each order
    const ordersWithItemCount = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();

        return {
          ...order,
          itemCount: items.length,
        };
      })
    );

    return ordersWithItemCount;
  },
});

/**
 * Get seller's received orders
 *
 * @param status - Optional status filter
 * @param limit - Number of orders to return
 * @returns List of orders containing seller's products
 */
export const getSellerOrders = sellerQuery({
  args: {
    status: v.optional(orderStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    // Get order items for this seller
    let orderItemsQuery;

    if (args.status) {
      orderItemsQuery = ctx.db
        .query("orderItems")
        .withIndex("by_seller_status", (q) =>
          q.eq("sellerId", ctx.userId).eq("status", args.status!)
        );
    } else {
      orderItemsQuery = ctx.db
        .query("orderItems")
        .withIndex("by_seller", (q) => q.eq("sellerId", ctx.userId));
    }

    const orderItems = await orderItemsQuery.order("desc").take(limit);

    // Get unique orders
    const orderIds = [...new Set(orderItems.map((item) => item.orderId))];

    const orders = await Promise.all(
      orderIds.map(async (orderId) => {
        const order = await ctx.db.get(orderId);
        if (!order) return null;

        // Get only this seller's items
        const sellerItems = orderItems.filter((item) => item.orderId === orderId);

        // Get buyer info
        const buyer = await ctx.db.get(order.userId);

        return {
          ...order,
          items: sellerItems,
          buyer: buyer
            ? {
                id: buyer._id,
                name: buyer.name,
                email: buyer.email,
              }
            : null,
        };
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
 * Example:
 *   await checkRateLimitWithDb(ctx, `createOrder:${userId}`, rateLimitConfigs.orderCreation);
 * Deferred to avoid coupling with payment flow changes.
 *
 * @param shippingAddress - Shipping address
 * @param billingAddress - Billing address (optional, uses shipping if not provided)
 * @param notes - Order notes
 * @returns Created order ID
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

    // Get user's cart
    let cart;
    if (args.tenantId) {
      cart = await ctx.db
        .query("carts")
        .withIndex("by_tenant_user", (q) =>
          q.eq("tenantId", args.tenantId).eq("userId", userId)
        )
        .first();
    } else {
      cart = await ctx.db
        .query("carts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    if (!cart) {
      throw createError(ErrorCode.NOT_FOUND, "Cart not found");
    }

    // Get cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    if (cartItems.length === 0) {
      throw createError(ErrorCode.VALIDATION_FAILED, "Cart is empty");
    }

    // BUG FIX B1: Store validated products in a Map during the validation phase
    // so we can reuse them during inventory deduction, avoiding a redundant
    // second ctx.db.get() call that could read stale data (race condition).
    const validatedProducts = new Map<Id<"products">, Doc<"products">>();

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      if (!product || product.isDeleted || product.status !== "active") {
        throw createError(
          ErrorCode.NOT_FOUND,
          `Product ${cartItem.productId} is no longer available`
        );
      }

      // Check inventory
      if (product.trackInventory && product.inventory !== undefined) {
        if (product.inventory < cartItem.quantity) {
          throw createError(
            ErrorCode.INSUFFICIENT_INVENTORY,
            `Insufficient inventory for ${product.name}`
          );
        }
      }

      // BUG FIX B1: Cache the product for reuse during inventory deduction
      validatedProducts.set(product._id, product);

      const itemSubtotal = product.price * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        productId: product._id,
        sellerId: product.sellerId,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Calculate totals (simplified - in production would include tax/shipping calculation)
    const tax = 0; // Would be calculated based on location
    const shipping = 0; // Would be calculated based on items and location
    const discount = 0; // Would be applied from coupons
    const total = subtotal + tax + shipping - discount;

    const now = Date.now();

    // BUG FIX B5: Use shared crypto-secure order number generator
    // instead of inline Math.random() which is not cryptographically secure
    const orderNumber = generateOrderNumber();

    // Create order
    const orderId = await ctx.db.insert("orders", {
      tenantId: args.tenantId,
      userId,
      orderNumber,
      status: "pending",
      subtotal,
      tax,
      shipping,
      discount,
      total,
      currency: cart.currency,
      shippingAddress: args.shippingAddress,
      billingAddress: args.billingAddress ?? args.shippingAddress,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Create order items and update inventory
    for (const itemData of orderItemsData) {
      await ctx.db.insert("orderItems", {
        orderId,
        productId: itemData.productId,
        sellerId: itemData.sellerId,
        name: itemData.name,
        sku: itemData.sku,
        price: itemData.price,
        quantity: itemData.quantity,
        subtotal: itemData.subtotal,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });

      // BUG FIX B1: Reuse product data from the validation phase instead of
      // fetching again — eliminates the race condition where inventory could
      // change between the two reads. Also combines inventory deduction and
      // salesCount update into a SINGLE patch to avoid overwriting changes.
      const product = validatedProducts.get(itemData.productId);
      if (product) {
        const patchData: { salesCount: number; inventory?: number } = {
          salesCount: (product.salesCount ?? 0) + itemData.quantity,
        };
        if (product.trackInventory && product.inventory !== undefined) {
          patchData.inventory = product.inventory - itemData.quantity;
        }
        await ctx.db.patch(itemData.productId, patchData);
      }
    }

    // Clear cart
    for (const cartItem of cartItems) {
      await ctx.db.delete(cartItem._id);
    }

    await ctx.db.patch(cart._id, {
      subtotal: 0,
      itemCount: 0,
      updatedAt: now,
    });

    return { orderId, orderNumber };
  },
});

/**
 * Update order status
 *
 * @param orderId - Order ID
 * @param status - New status
 * @returns Success boolean
 */
export const updateOrderStatus = authenticatedMutation({
  args: {
    orderId: v.id("orders"),
    status: orderStatusValidator,
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
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

    // Sellers can update status of their items
    if (isSeller && !isAdmin) {
      const sellerItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
        .filter((q) => q.eq(q.field("sellerId"), ctx.userId))
        .collect();

      if (sellerItems.length === 0) {
        throw createError(
          ErrorCode.FORBIDDEN,
          "Not authorized to update this order"
        );
      }

      // Update only seller's items
      const now = Date.now();
      for (const item of sellerItems) {
        await ctx.db.patch(item._id, {
          status: args.status,
          updatedAt: now,
        });
      }

      return true;
    }

    const now = Date.now();
    const updates = buildOrderStatusUpdate(args.status, now);

    await ctx.db.patch(args.orderId, updates);

    // Update all order items status
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

    // If cancelled, restore inventory
    if (args.status === "cancelled") {
      await restoreInventoryForOrderItems(ctx, orderItems);
    }

    return true;
  },
});

/**
 * Cancel an order (customer)
 *
 * @param orderId - Order ID
 * @returns Success boolean
 */
export const cancelOrder = authenticatedMutation({
  args: {
    orderId: v.id("orders"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw createError(ErrorCode.NOT_FOUND, "Order not found");
    }

    // Only order owner can cancel
    if (order.userId !== ctx.userId) {
      const role = await resolveUserRole(ctx, ctx.userId);
      if (role !== "admin") {
        throw createError(ErrorCode.FORBIDDEN, "Not authorized to cancel this order");
      }
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      throw createError(
        ErrorCode.ORDER_NOT_MODIFIABLE,
        "Order cannot be cancelled at this stage"
      );
    }

    const now = Date.now();

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
      cancelledAt: now,
      notes: args.reason ? `${order.notes || ""}\nCancellation reason: ${args.reason}` : order.notes,
      updatedAt: now,
    });

    // Update order items and restore inventory
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    for (const item of orderItems) {
      await ctx.db.patch(item._id, {
        status: "cancelled",
        updatedAt: now,
      });
    }

    await restoreInventoryForOrderItems(ctx, orderItems);

    return true;
  },
});

// ============================================================================
// Seller Dashboard Queries
// ============================================================================

/**
 * Get seller dashboard statistics
 *
 * @returns Seller-specific stats: revenue, orders, products, views
 */
export const getSellerDashboardStats = sellerQuery({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    // Get seller's products
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

    // Get seller's order items
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

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
 *
 * @returns Array of { name, revenue, orders } for last 12 months
 */
export const getSellerMonthlyRevenue = sellerQuery({
  args: {},
  handler: async (ctx) => {
    const userId = ctx.userId;

    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    // Get seller's order items from last 12 months
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

    // Get order dates for each item
    const itemsWithDates = await Promise.all(
      orderItems.map(async (item) => {
        const order = await ctx.db.get(item.orderId);
        return order && order.createdAt > oneYearAgo
          ? { subtotal: item.subtotal, createdAt: order.createdAt }
          : null;
      })
    );

    const validItems = itemsWithDates.filter(Boolean) as {
      subtotal: number;
      createdAt: number;
    }[];

    // Group by month
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

    const monthlyData: Record<
      string,
      { revenue: number; orders: number }
    > = {};

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
 *
 * @param limit - Number of reviews to return
 * @returns Reviews with product and user info
 */
export const getSellerProductReviews = sellerQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const limit = args.limit ?? 20;

    // Get seller's product IDs
    const products = await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const productIds = new Set(products.map((p) => String(p._id)));

    // Get reviews for these products
    const allReviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(200); // fetch a batch, then filter

    const sellerReviews = allReviews
      .filter((r) => productIds.has(String(r.productId)))
      .slice(0, limit);

    // Enrich with product and user info
    const reviewsWithDetails = await Promise.all(
      sellerReviews.map(async (review) => {
        const product = await ctx.db.get(review.productId);
        const user = (await ctx.db.get(review.userId)) as {
          _id: Id<"users">;
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
