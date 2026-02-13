/**
 * Orders Domain Types
 *
 * Central type definitions for the orders domain.
 * All monetary values are in cents (integer).
 */

import type { Doc, Id } from "../../_generated/dataModel";

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

/** Union of all valid order statuses (mirrors schema orderStatusValidator). */
export type OrderStatus = Doc<"orders">["status"];

/** Describes a legal status transition. */
export interface StatusTransition {
  from: OrderStatus;
  to: OrderStatus;
}

/** Aggregated order totals — all amounts in cents. */
export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Status update DTO (moved from old lib/orders.ts)
// ---------------------------------------------------------------------------

export interface OrderStatusUpdate {
  status: OrderStatus;
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

// ---------------------------------------------------------------------------
// Input DTOs
// ---------------------------------------------------------------------------

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress {
  name: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/** Data needed to create a new order from a cart. */
export interface CreateOrderInput {
  tenantId?: Id<"tenants">;
  userId: Id<"users">;
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  notes?: string;
}

/** Data needed to cancel an order. */
export interface CancelOrderInput {
  orderId: Id<"orders">;
  userId: Id<"users">;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Intermediate data structures used during order creation
// ---------------------------------------------------------------------------

/** Pre-validated line item ready to be persisted as an orderItem. */
export interface ValidatedOrderItem {
  productId: Id<"products">;
  sellerId: Id<"users">;
  name: string;
  sku?: string;
  price: number;
  quantity: number;
  subtotal: number;
}
