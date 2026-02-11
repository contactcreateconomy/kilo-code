import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { createError, ErrorCode } from "./errors";

type QueryDbCtx = Pick<QueryCtx, "db">;
type MutationDbCtx = Pick<MutationCtx, "db">;

export interface OrderStatusUpdate {
  status: Doc<"orders">["status"];
  updatedAt: number;
  trackingNumber?: string;
  trackingUrl?: string;
  paidAt?: number;
  shippedAt?: number;
  deliveredAt?: number;
  cancelledAt?: number;
  cancelReason?: string;
  refundedAt?: number;
  refundAmount?: number;
  refundReason?: string;
  notes?: string;
}

export async function resolveUserRole(
  ctx: QueryDbCtx | MutationDbCtx,
  userId: Id<"users">
): Promise<string> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  return profile?.defaultRole ?? "customer";
}

export async function assertCanViewOrder(
  ctx: QueryDbCtx | MutationDbCtx,
  params: {
    viewerId: Id<"users">;
    orderId: Id<"orders">;
    orderUserId: Id<"users">;
  }
): Promise<void> {
  const role = await resolveUserRole(ctx, params.viewerId);

  if (params.orderUserId === params.viewerId || role === "admin") {
    return;
  }

  if (role === "seller") {
    const sellerItem = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", params.orderId))
      .filter((q) => q.eq(q.field("sellerId"), params.viewerId))
      .first();

    if (sellerItem) {
      return;
    }
  }

  throw createError(ErrorCode.FORBIDDEN, "Not authorized to view this order");
}

export function buildOrderStatusUpdate(
  status: Doc<"orders">["status"],
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
