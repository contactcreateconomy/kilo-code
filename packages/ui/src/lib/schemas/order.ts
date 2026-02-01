/**
 * Order Validation Schemas
 *
 * Zod schemas for order-related data validation.
 */

import { z } from "zod";

// ============================================================================
// Order Status
// ============================================================================

export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  "partially_refunded",
  "disputed",
  "cancelled",
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

// ============================================================================
// Payment Status
// ============================================================================

export const paymentStatusSchema = z.enum([
  "pending",
  "processing",
  "succeeded",
  "failed",
  "refunded",
  "cancelled",
]);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// ============================================================================
// Order Item Schema
// ============================================================================

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  price: z.number().int().min(0, "Price cannot be negative"),
  name: z.string().min(1, "Product name is required"),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// ============================================================================
// Billing Address Schema
// ============================================================================

export const billingAddressSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  line1: z.string().min(1, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().length(2, "Country must be a 2-letter code"),
});

export type BillingAddress = z.infer<typeof billingAddressSchema>;

// ============================================================================
// Order Creation Schema
// ============================================================================

export const orderCreateSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  billingAddress: billingAddressSchema.optional(),
  couponCode: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export type OrderCreate = z.infer<typeof orderCreateSchema>;

// ============================================================================
// Checkout Schema
// ============================================================================

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1).default(1),
    })
  ).min(1, "Cart is empty"),
  email: z.string().email("Invalid email address"),
  billingAddress: billingAddressSchema.optional(),
  couponCode: z.string().max(50).optional(),
  paymentMethodId: z.string().optional(),
  savePaymentMethod: z.boolean().optional(),
});

export type Checkout = z.infer<typeof checkoutSchema>;

// ============================================================================
// Refund Request Schema
// ============================================================================

export const refundRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.enum([
    "duplicate",
    "fraudulent",
    "requested_by_customer",
    "product_not_received",
    "product_unacceptable",
    "other",
  ]),
  description: z.string().max(1000).optional(),
  amount: z.number().int().min(1, "Refund amount must be positive").optional(),
  refundAll: z.boolean().default(true),
});

export type RefundRequest = z.infer<typeof refundRequestSchema>;

// ============================================================================
// Order Search Schema
// ============================================================================

export const orderSearchSchema = z.object({
  query: z.string().max(200).optional(),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  customerId: z.string().optional(),
  sellerId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["date_asc", "date_desc", "amount_asc", "amount_desc"]).optional(),
});

export type OrderSearch = z.infer<typeof orderSearchSchema>;

// ============================================================================
// Order Update Schema (Admin)
// ============================================================================

export const orderUpdateSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  status: orderStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  trackingNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url().optional(),
});

export type OrderUpdate = z.infer<typeof orderUpdateSchema>;

// ============================================================================
// Coupon Validation Schema
// ============================================================================

export const couponValidationSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50),
  orderTotal: z.number().int().min(0),
  productIds: z.array(z.string()).optional(),
});

export type CouponValidation = z.infer<typeof couponValidationSchema>;
