/**
 * Orders Repository
 *
 * Database access patterns for the orders domain.
 * Every function receives a Convex context (QueryCtx or MutationCtx)
 * so it executes inside Convex's transactional runtime.
 *
 * All monetary values are in cents (integer).
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { createError, ErrorCode } from "../errors";
import { generateOrderNumber } from "../orderUtils";
import type { OrderStatus, OrderTotals, ShippingAddress, BillingAddress, ValidatedOrderItem } from "./orders.types";

type ReadCtx = Pick<QueryCtx, "db">;
type WriteCtx = Pick<MutationCtx, "db">;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Fetch a single order by its ID, or null if not found. */
export async function getOrderById(
  ctx: ReadCtx,
  orderId: Id<"orders">
): Promise<Doc<"orders"> | null> {
  return await ctx.db.get(orderId);
}

/** Fetch an order together with its line items. */
export async function getOrderWithItems(
  ctx: ReadCtx,
  orderId: Id<"orders">
): Promise<{ order: Doc<"orders">; items: Doc<"orderItems">[] } | null> {
  const order = await ctx.db.get(orderId);
  if (!order) return null;

  const items = await ctx.db
    .query("orderItems")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();

  return { order, items };
}

/** Fetch orders for a user, optionally filtered by status. */
export async function getOrdersByUser(
  ctx: ReadCtx,
  userId: Id<"users">,
  statusFilter?: OrderStatus,
  limit: number = 20
): Promise<Doc<"orders">[]> {
  let q;

  if (statusFilter) {
    q = ctx.db
      .query("orders")
      .withIndex("by_user_status", (idx) =>
        idx.eq("userId", userId).eq("status", statusFilter)
      );
  } else {
    q = ctx.db
      .query("orders")
      .withIndex("by_user", (idx) => idx.eq("userId", userId));
  }

  return await q.order("desc").take(limit);
}

/** Fetch order items belonging to a seller, optionally filtered by status. */
export async function getOrderItemsBySeller(
  ctx: ReadCtx,
  sellerId: Id<"users">,
  statusFilter?: OrderStatus,
  limit: number = 50
): Promise<Doc<"orderItems">[]> {
  let q;

  if (statusFilter) {
    q = ctx.db
      .query("orderItems")
      .withIndex("by_seller_status", (idx) =>
        idx.eq("sellerId", sellerId).eq("status", statusFilter)
      );
  } else {
    q = ctx.db
      .query("orderItems")
      .withIndex("by_seller", (idx) => idx.eq("sellerId", sellerId));
  }

  return await q.order("desc").take(limit);
}

/** Fetch items for a specific order. */
export async function getOrderItems(
  ctx: ReadCtx,
  orderId: Id<"orders">
): Promise<Doc<"orderItems">[]> {
  return await ctx.db
    .query("orderItems")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .collect();
}

/** Find the payment record associated with an order. */
export async function getPaymentForOrder(
  ctx: ReadCtx,
  orderId: Id<"orders">
): Promise<Doc<"stripePayments"> | null> {
  return await ctx.db
    .query("stripePayments")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .first();
}

/** Find an order by its human-readable order number. */
export async function getOrderByNumber(
  ctx: ReadCtx,
  orderNumber: string
): Promise<Doc<"orders"> | null> {
  return await ctx.db
    .query("orders")
    .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
    .first();
}

/** Fetch the user's cart, optionally scoped to a tenant. */
export async function getUserCart(
  ctx: ReadCtx,
  userId: Id<"users">,
  tenantId?: Id<"tenants">
): Promise<Doc<"carts"> | null> {
  if (tenantId) {
    return await ctx.db
      .query("carts")
      .withIndex("by_tenant_user", (q) =>
        q.eq("tenantId", tenantId).eq("userId", userId)
      )
      .first();
  }

  return await ctx.db
    .query("carts")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

/** Fetch all items in a cart. */
export async function getCartItems(
  ctx: ReadCtx,
  cartId: Id<"carts">
): Promise<Doc<"cartItems">[]> {
  return await ctx.db
    .query("cartItems")
    .withIndex("by_cart", (q) => q.eq("cartId", cartId))
    .collect();
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/** Insert a new order record and return its ID + order number. */
export async function createOrderRecord(
  ctx: WriteCtx,
  data: {
    tenantId?: Id<"tenants">;
    userId: Id<"users">;
    totals: OrderTotals;
    currency: string;
    shippingAddress: ShippingAddress;
    billingAddress: BillingAddress | ShippingAddress;
    notes?: string;
    now: number;
  }
): Promise<{ orderId: Id<"orders">; orderNumber: string }> {
  const orderNumber = generateOrderNumber();

  const orderId = await ctx.db.insert("orders", {
    tenantId: data.tenantId,
    userId: data.userId,
    orderNumber,
    status: "pending",
    subtotal: data.totals.subtotal,
    tax: data.totals.tax,
    shipping: data.totals.shipping,
    discount: data.totals.discount,
    total: data.totals.total,
    currency: data.currency,
    shippingAddress: data.shippingAddress,
    billingAddress: data.billingAddress,
    notes: data.notes,
    createdAt: data.now,
    updatedAt: data.now,
  });

  return { orderId, orderNumber };
}

/**
 * Insert order items and adjust product inventory / salesCount.
 *
 * `validatedProducts` is a pre-fetched Map to avoid re-reading products
 * (BUG FIX B1 pattern).
 */
export async function createOrderItems(
  ctx: WriteCtx,
  orderId: Id<"orders">,
  items: ValidatedOrderItem[],
  validatedProducts: Map<Id<"products">, Doc<"products">>,
  now: number
): Promise<void> {
  for (const itemData of items) {
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

    // BUG FIX B1: Reuse validated product data
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
}

/** Patch the order's status and any associated timestamp fields. */
export async function updateOrderStatus(
  ctx: WriteCtx,
  orderId: Id<"orders">,
  updates: Partial<Doc<"orders">>
): Promise<void> {
  await ctx.db.patch(orderId, updates);
}

/** Bulk-update status on a set of order items. */
export async function updateOrderItemsStatus(
  ctx: WriteCtx,
  orderItems: Doc<"orderItems">[],
  status: OrderStatus,
  now: number
): Promise<void> {
  for (const item of orderItems) {
    await ctx.db.patch(item._id, {
      status,
      updatedAt: now,
    });
  }
}

/** Delete all cart items and reset the cart totals. */
export async function clearCart(
  ctx: WriteCtx,
  cartId: Id<"carts">,
  cartItems: Doc<"cartItems">[],
  now: number
): Promise<void> {
  for (const cartItem of cartItems) {
    await ctx.db.delete(cartItem._id);
  }

  await ctx.db.patch(cartId, {
    subtotal: 0,
    itemCount: 0,
    updatedAt: now,
  });
}

/** Fetch seller's items within a specific order. */
export async function getSellerItemsForOrder(
  ctx: ReadCtx,
  orderId: Id<"orders">,
  sellerId: Id<"users">
): Promise<Doc<"orderItems">[]> {
  return await ctx.db
    .query("orderItems")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .filter((q) => q.eq(q.field("sellerId"), sellerId))
    .collect();
}
