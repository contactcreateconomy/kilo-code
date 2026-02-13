/**
 * Orders Domain Policies
 *
 * Status transition rules and access-control predicates for the orders domain.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { createError, ErrorCode } from "../errors";
import type { OrderStatus } from "./orders.types";
import { resolveUserRole } from "./orders.service";

// ---------------------------------------------------------------------------
// Status transition map
// ---------------------------------------------------------------------------

/**
 * Defines which status transitions are legal.
 * Key = current status, Value = list of statuses reachable from it.
 */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "processing", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["refunded", "partially_refunded", "disputed"],
  cancelled: [],
  refunded: [],
  partially_refunded: ["refunded", "disputed"],
  disputed: ["refunded", "cancelled"],
};

// ---------------------------------------------------------------------------
// Guard predicates
// ---------------------------------------------------------------------------

/** Returns true when the order is in a state that allows cancellation. */
export function canCancel(status: OrderStatus): boolean {
  return status === "pending" || status === "confirmed";
}

/**
 * Assert the viewer is authorised to see the order.
 * Moved from the old lib/orders.ts.
 *
 * Rules:
 * - The order owner can always view their order.
 * - Admins can view any order.
 * - Sellers can view orders that contain their items.
 */
export async function assertCanViewOrder(
  ctx: Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">,
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
