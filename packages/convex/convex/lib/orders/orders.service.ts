/**
 * Orders Domain Service
 *
 * Pure business-logic functions for the orders domain.
 * Functions that need DB access accept a minimal context argument
 * so they work within Convex's execution model.
 *
 * All monetary values are in cents (integer).
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { createError, ErrorCode } from "../errors";
import type {
  OrderStatus,
  OrderStatusUpdate,
  OrderTotals,
  ValidatedOrderItem,
} from "./orders.types";

type DbCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;
type MutationDbCtx = Pick<MutationCtx, "db">;

// ---------------------------------------------------------------------------
// Role resolution (moved from old lib/orders.ts)
// ---------------------------------------------------------------------------

/**
 * Looks up the user's role from their profile.
 * Returns "customer" when no profile exists.
 */
export async function resolveUserRole(
  ctx: DbCtx,
  userId: Id<"users">
): Promise<string> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  return profile?.defaultRole ?? "customer";
}

// ---------------------------------------------------------------------------
// Cart validation
// ---------------------------------------------------------------------------

/**
 * Validates cart items against product data.
 *
 * Checks that every product exists, is active, and has enough inventory.
 * Returns validated line items and a Map of product docs for reuse
 * during inventory deduction (prevents the BUG FIX B1 race-condition).
 */
export async function validateCart(
  ctx: Pick<QueryCtx, "db">,
  cartItems: Array<Doc<"cartItems">>
): Promise<{
  orderItems: ValidatedOrderItem[];
  validatedProducts: Map<Id<"products">, Doc<"products">>;
}> {
  if (cartItems.length === 0) {
    throw createError(ErrorCode.VALIDATION_FAILED, "Cart is empty");
  }

  const validatedProducts = new Map<Id<"products">, Doc<"products">>();
  const orderItems: ValidatedOrderItem[] = [];

  for (const cartItem of cartItems) {
    const product = await ctx.db.get(cartItem.productId);

    if (!product || product.isDeleted || product.status !== "active") {
      throw createError(
        ErrorCode.NOT_FOUND,
        `Product ${cartItem.productId} is no longer available`
      );
    }

    if (product.trackInventory && product.inventory !== undefined) {
      if (product.inventory < cartItem.quantity) {
        throw createError(
          ErrorCode.INSUFFICIENT_INVENTORY,
          `Insufficient inventory for ${product.name}`
        );
      }
    }

    validatedProducts.set(product._id, product);

    const itemSubtotal = product.price * cartItem.quantity;

    orderItems.push({
      productId: product._id,
      sellerId: product.sellerId,
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: cartItem.quantity,
      subtotal: itemSubtotal,
    });
  }

  return { orderItems, validatedProducts };
}

// ---------------------------------------------------------------------------
// Totals calculation
// ---------------------------------------------------------------------------

/**
 * Calculates order totals from validated line items.
 * Tax/shipping/discount are stub-zero for now (production would compute them
 * based on location and coupon logic).
 */
export function calculateOrderTotals(
  items: ValidatedOrderItem[]
): OrderTotals {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = 0; // Would be calculated based on location
  const shipping = 0; // Would be calculated based on items and location
  const discount = 0; // Would be applied from coupons
  const total = subtotal + tax + shipping - discount;

  return { subtotal, tax, shipping, discount, total };
}

// ---------------------------------------------------------------------------
// Status update builder (moved from old lib/orders.ts)
// ---------------------------------------------------------------------------

/**
 * Builds a patch object for an order status transition, automatically
 * setting timestamp fields for well-known statuses.
 */
export function buildOrderStatusUpdate(
  status: OrderStatus,
  now: number
): OrderStatusUpdate {
  const updates: OrderStatusUpdate = {
    status,
    updatedAt: now,
  };

  switch (status) {
    case "shipped":
      updates.shippedAt = now;
      break;
    case "delivered":
      updates.deliveredAt = now;
      break;
    case "cancelled":
      updates.cancelledAt = now;
      break;
    default:
      break;
  }

  return updates;
}

// ---------------------------------------------------------------------------
// Inventory restoration (moved from old lib/orders.ts)
// ---------------------------------------------------------------------------

/**
 * Restores inventory counts for each order item's product after cancellation.
 * Also decrements the product's salesCount (clamped at 0).
 */
export async function restoreInventoryForOrderItems(
  ctx: MutationDbCtx,
  orderItems: Array<Doc<"orderItems">>
): Promise<void> {
  for (const item of orderItems) {
    const product = await ctx.db.get(item.productId);
    if (!product || !product.trackInventory || product.inventory === undefined) {
      continue;
    }

    await ctx.db.patch(item.productId, {
      inventory: product.inventory + item.quantity,
      salesCount: Math.max(0, product.salesCount - item.quantity),
    });
  }
}
