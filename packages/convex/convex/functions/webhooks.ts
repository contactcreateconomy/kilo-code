import { internalMutation, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

/**
 * Stripe Webhook Event Handlers
 *
 * These functions process incoming Stripe webhook events.
 * They are called from the HTTP endpoint after signature verification.
 */

// ============================================================================
// Checkout Session Handlers
// ============================================================================

/**
 * Handle checkout.session.completed event
 * Creates order and updates payment status
 */
export const handleCheckoutCompleted = internalMutation({
  args: {
    sessionId: v.string(),
    paymentIntentId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    amountTotal: v.number(),
    currency: v.string(),
    paymentStatus: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if we already have a payment record for this session
    const existingPayment = await ctx.db
      .query("stripePayments")
      .withIndex("by_checkout_session", (q) =>
        q.eq("stripeCheckoutSessionId", args.sessionId)
      )
      .first();

    if (existingPayment) {
      // Update existing payment
      await ctx.db.patch(existingPayment._id, {
        status: args.paymentStatus === "paid" ? "succeeded" : "pending",
        stripePaymentIntentId: args.paymentIntentId,
        stripeCustomerId: args.customerId,
        updatedAt: now,
      });

      // Update order if exists
      if (existingPayment.orderId && args.paymentStatus === "paid") {
        const order = await ctx.db.get(existingPayment.orderId);
        if (order && order.status === "pending") {
          await ctx.db.patch(existingPayment.orderId, {
            status: "confirmed",
            paidAt: now,
            updatedAt: now,
          });
        }
      }

      return { paymentId: existingPayment._id, orderId: existingPayment.orderId };
    }

    // Try to find user from metadata or customer email
    let userId: Id<"users"> | undefined;

    if (args.metadata?.userId) {
      userId = args.metadata.userId as Id<"users">;
    } else if (args.customerEmail) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.customerEmail))
        .first();
      userId = user?._id;
    }

    if (!userId) {
      console.log("Could not find user for checkout session:", args.sessionId);
      return { error: "User not found" };
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId,
      orderNumber,
      status: args.paymentStatus === "paid" ? "confirmed" : "pending",
      totalAmount: args.amountTotal,
      currency: args.currency,
      paidAt: args.paymentStatus === "paid" ? now : undefined,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    // Create payment record
    const paymentId = await ctx.db.insert("stripePayments", {
      userId,
      orderId,
      stripePaymentIntentId: args.paymentIntentId,
      stripeCheckoutSessionId: args.sessionId,
      stripeCustomerId: args.customerId ?? "",
      amount: args.amountTotal,
      currency: args.currency,
      status: args.paymentStatus === "paid" ? "succeeded" : "pending",
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    // Clear user's cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { paymentId, orderId, orderNumber };
  },
});

/**
 * Handle checkout.session.expired event
 */
export const handleCheckoutExpired = internalMutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_checkout_session", (q) =>
        q.eq("stripeCheckoutSessionId", args.sessionId)
      )
      .first();

    if (payment) {
      await ctx.db.patch(payment._id, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ============================================================================
// Payment Intent Handlers
// ============================================================================

/**
 * Handle payment_intent.succeeded event
 */
export const handlePaymentSucceeded = internalMutation({
  args: {
    paymentIntentId: v.string(),
    chargeId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (!payment) {
      console.log("Payment not found for intent:", args.paymentIntentId);
      return { success: false, error: "Payment not found" };
    }

    const now = Date.now();

    await ctx.db.patch(payment._id, {
      status: "succeeded",
      stripeChargeId: args.chargeId,
      receiptUrl: args.receiptUrl,
      paymentMethod: args.paymentMethod,
      updatedAt: now,
    });

    // Update order status if exists
    if (payment.orderId) {
      const order = await ctx.db.get(payment.orderId);
      if (order && order.status === "pending") {
        await ctx.db.patch(payment.orderId, {
          status: "confirmed",
          paidAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true, paymentId: payment._id };
  },
});

/**
 * Handle payment_intent.payment_failed event
 */
export const handlePaymentFailed = internalMutation({
  args: {
    paymentIntentId: v.string(),
    failureCode: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (!payment) {
      console.log("Payment not found for intent:", args.paymentIntentId);
      return { success: false, error: "Payment not found" };
    }

    await ctx.db.patch(payment._id, {
      status: "failed",
      failureCode: args.failureCode,
      failureMessage: args.failureMessage,
      updatedAt: Date.now(),
    });

    return { success: true, paymentId: payment._id };
  },
});

/**
 * Handle payment_intent.canceled event
 */
export const handlePaymentCanceled = internalMutation({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    await ctx.db.patch(payment._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true, paymentId: payment._id };
  },
});

// ============================================================================
// Refund Handlers
// ============================================================================

/**
 * Handle charge.refunded event
 */
export const handleRefundCreated = internalMutation({
  args: {
    paymentIntentId: v.string(),
    refundId: v.string(),
    amount: v.number(),
    status: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("stripePayments")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.paymentIntentId)
      )
      .first();

    if (!payment) {
      console.log("Payment not found for refund:", args.paymentIntentId);
      return { success: false, error: "Payment not found" };
    }

    const now = Date.now();

    // Determine if partial or full refund
    const isPartialRefund = args.amount < payment.amount;

    await ctx.db.patch(payment._id, {
      status: isPartialRefund ? "partially_refunded" : "refunded",
      refundedAmount: (payment.refundedAmount ?? 0) + args.amount,
      updatedAt: now,
    });

    // Update order status if exists
    if (payment.orderId) {
      const order = await ctx.db.get(payment.orderId);
      if (order) {
        await ctx.db.patch(payment.orderId, {
          status: isPartialRefund ? "partially_refunded" : "refunded",
          refundedAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true, paymentId: payment._id };
  },
});

// ============================================================================
// Stripe Connect Handlers
// ============================================================================

/**
 * Handle account.updated event for Connect accounts
 */
export const handleConnectAccountUpdated = internalMutation({
  args: {
    accountId: v.string(),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    detailsSubmitted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("stripeConnectAccounts")
      .withIndex("by_stripe_account", (q) =>
        q.eq("stripeAccountId", args.accountId)
      )
      .first();

    if (!account) {
      console.log("Connect account not found:", args.accountId);
      return { success: false, error: "Account not found" };
    }

    await ctx.db.patch(account._id, {
      chargesEnabled: args.chargesEnabled,
      payoutsEnabled: args.payoutsEnabled,
      detailsSubmitted: args.detailsSubmitted,
      updatedAt: Date.now(),
    });

    // Update seller status if fully onboarded
    if (args.chargesEnabled && args.payoutsEnabled && args.detailsSubmitted) {
      const seller = await ctx.db.get(account.sellerId);
      if (seller) {
        await ctx.db.patch(account.sellerId, {
          stripeOnboarded: true,
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true, accountId: account._id };
  },
});

/**
 * Handle account.application.deauthorized event
 */
export const handleConnectAccountDeauthorized = internalMutation({
  args: {
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("stripeConnectAccounts")
      .withIndex("by_stripe_account", (q) =>
        q.eq("stripeAccountId", args.accountId)
      )
      .first();

    if (!account) {
      return { success: false, error: "Account not found" };
    }

    // Mark account as deauthorized
    await ctx.db.patch(account._id, {
      chargesEnabled: false,
      payoutsEnabled: false,
      deauthorizedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update seller status
    const seller = await ctx.db.get(account.sellerId);
    if (seller) {
      await ctx.db.patch(account.sellerId, {
        stripeOnboarded: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ============================================================================
// Dispute Handlers
// ============================================================================

/**
 * Handle charge.dispute.created event
 */
export const handleDisputeCreated = internalMutation({
  args: {
    disputeId: v.string(),
    chargeId: v.string(),
    paymentIntentId: v.optional(v.string()),
    amount: v.number(),
    reason: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find the payment by charge ID or payment intent
    let payment = null;

    if (args.paymentIntentId) {
      payment = await ctx.db
        .query("stripePayments")
        .withIndex("by_stripe_payment_intent", (q) =>
          q.eq("stripePaymentIntentId", args.paymentIntentId)
        )
        .first();
    }

    if (!payment) {
      payment = await ctx.db
        .query("stripePayments")
        .withIndex("by_stripe_charge", (q) =>
          q.eq("stripeChargeId", args.chargeId)
        )
        .first();
    }

    // Record the dispute
    const disputeId = await ctx.db.insert("stripeDisputes", {
      stripeDisputeId: args.disputeId,
      stripeChargeId: args.chargeId,
      stripePaymentIntentId: args.paymentIntentId,
      paymentId: payment?._id,
      orderId: payment?.orderId,
      amount: args.amount,
      reason: args.reason,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });

    // Update payment status
    if (payment) {
      await ctx.db.patch(payment._id, {
        status: "disputed",
        updatedAt: now,
      });

      // Update order status
      if (payment.orderId) {
        await ctx.db.patch(payment.orderId, {
          status: "disputed",
          updatedAt: now,
        });
      }
    }

    return { success: true, disputeId };
  },
});

/**
 * Handle charge.dispute.updated event
 */
export const handleDisputeUpdated = internalMutation({
  args: {
    disputeId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const dispute = await ctx.db
      .query("stripeDisputes")
      .withIndex("by_stripe_dispute", (q) =>
        q.eq("stripeDisputeId", args.disputeId)
      )
      .first();

    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    await ctx.db.patch(dispute._id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // If dispute is resolved, update payment and order
    if (args.status === "won" || args.status === "lost") {
      if (dispute.paymentId) {
        const payment = await ctx.db.get(dispute.paymentId);
        if (payment) {
          await ctx.db.patch(dispute.paymentId, {
            status: args.status === "won" ? "succeeded" : "refunded",
            updatedAt: Date.now(),
          });

          if (payment.orderId) {
            await ctx.db.patch(payment.orderId, {
              status: args.status === "won" ? "confirmed" : "refunded",
              updatedAt: Date.now(),
            });
          }
        }
      }
    }

    return { success: true };
  },
});

/**
 * Handle charge.dispute.closed event
 */
export const handleDisputeClosed = internalMutation({
  args: {
    disputeId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const dispute = await ctx.db
      .query("stripeDisputes")
      .withIndex("by_stripe_dispute", (q) =>
        q.eq("stripeDisputeId", args.disputeId)
      )
      .first();

    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    await ctx.db.patch(dispute._id, {
      status: args.status,
      closedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// Customer Handlers
// ============================================================================

/**
 * Handle customer.created event
 */
export const handleCustomerCreated = internalMutation({
  args: {
    customerId: v.string(),
    email: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Try to find user by email or metadata
    let userId: Id<"users"> | undefined;

    if (args.metadata?.userId) {
      userId = args.metadata.userId as Id<"users">;
    } else if (args.email) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      userId = user?._id;
    }

    if (!userId) {
      console.log("Could not find user for customer:", args.customerId);
      return { success: false, error: "User not found" };
    }

    const now = Date.now();

    // Check if customer record already exists
    const existingCustomer = await ctx.db
      .query("stripeCustomers")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.customerId)
      )
      .first();

    if (existingCustomer) {
      return { success: true, customerId: existingCustomer._id };
    }

    // Create customer record
    const customerId = await ctx.db.insert("stripeCustomers", {
      userId,
      stripeCustomerId: args.customerId,
      email: args.email,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, customerId };
  },
});

/**
 * Handle customer.updated event
 */
export const handleCustomerUpdated = internalMutation({
  args: {
    customerId: v.string(),
    email: v.optional(v.string()),
    defaultPaymentMethodId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("stripeCustomers")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", args.customerId)
      )
      .first();

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    await ctx.db.patch(customer._id, {
      email: args.email,
      defaultPaymentMethodId: args.defaultPaymentMethodId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
