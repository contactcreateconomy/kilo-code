/**
 * Orders Domain Mappers
 *
 * Response-shaping functions that transform raw DB documents into
 * the shapes returned by Convex query/mutation handlers.
 *
 * These are pure (no DB access) — they take already-fetched data and
 * reshape it for the client.
 */

import type { Doc, Id } from "../../_generated/dataModel";

// ---------------------------------------------------------------------------
// Product info attached to order item responses
// ---------------------------------------------------------------------------

export interface OrderItemProductInfo {
  id: Id<"products">;
  name: string;
  slug: string;
  primaryImage?: string;
}

// ---------------------------------------------------------------------------
// toOrderResponse — enriched order for getOrder
// ---------------------------------------------------------------------------

export function toOrderResponse(
  order: Doc<"orders">,
  itemsWithProducts: Array<
    Doc<"orderItems"> & { product: OrderItemProductInfo | null }
  >,
  payment: Doc<"stripePayments"> | null
) {
  return {
    ...order,
    items: itemsWithProducts,
    payment: toPaymentSummary(payment),
  };
}

// ---------------------------------------------------------------------------
// enrichOrderItem — attaches product info to an order item
// ---------------------------------------------------------------------------

export function enrichOrderItem(
  item: Doc<"orderItems">,
  product: Doc<"products"> | null,
  primaryImage: { url: string } | null
): Doc<"orderItems"> & { product: OrderItemProductInfo | null } {
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
}

// ---------------------------------------------------------------------------
// toOrderListItem — lightweight representation for getUserOrders list
// ---------------------------------------------------------------------------

export function toOrderListItem(order: Doc<"orders">, itemCount: number) {
  return {
    ...order,
    itemCount,
  };
}

// ---------------------------------------------------------------------------
// toSellerOrderView — for getSellerOrders
// ---------------------------------------------------------------------------

export function toSellerOrderView(
  order: Doc<"orders">,
  items: Doc<"orderItems">[],
  buyer: { _id: Id<"users">; name?: string; email?: string } | null
) {
  return {
    ...order,
    items,
    buyer: buyer
      ? {
          id: buyer._id,
          name: buyer.name,
          email: buyer.email,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// toPaymentSummary — payment information excerpt
// ---------------------------------------------------------------------------

export function toPaymentSummary(payment: Doc<"stripePayments"> | null) {
  if (!payment) return null;

  return {
    status: payment.status,
    amount: payment.amount,
    currency: payment.currency,
    paidAt: payment.status === "succeeded" ? payment.updatedAt : null,
  };
}
