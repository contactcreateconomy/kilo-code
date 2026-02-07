import { query, mutation, action, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";
import { paymentStatusValidator, metadataValidator } from "../schema";
import Stripe from "stripe";
import {
  getStripeClient,
  buildStripeLineItems,
  getConnectCapabilities,
  dollarsToCents,
  type CheckoutLineItem,
} from "../lib/stripe";
import { generateOrderNumber } from "../lib/orderUtils";

/**
 * Stripe Integration Functions
 *
 * Queries, mutations, and actions for Stripe payment processing
 * in the Createconomy marketplace.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get or create Stripe customer for the current user
 */
export const getStripeCustomer = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    let customer;

    if (args.tenantId) {
      customer = await ctx.db
        .query("stripeCustomers")
        .withIndex("by_user_tenant", (q) =>
          q.eq("userId", userId).eq("tenantId", args.tenantId)
        )
        .first();
    } else {
      customer = await ctx.db
        .query("stripeCustomers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    return customer;
  },
});

/**
 * Get payment history for the current user
 */
export const getPaymentHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit ?? 20;

    const payments = await ctx.db
      .query("stripePayments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    const paymentsWithOrders = await Promise.all(
      payments.map(async (payment) => {
        const order = payment.orderId
          ? await ctx.db.get(payment.orderId)
          : null;

        return {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          receiptUrl: payment.receiptUrl,
          createdAt: payment.createdAt,
          order: order
            ? {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
              }
            : null,
        };
      })
    );

    return paymentsWithOrders;
  },
});

/**
 * Get a specific payment by ID
 */
export const getPayment = query({
  args: {
    paymentId: v.id("stripePayments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) {
      return null;
    }

    if (payment.userId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw new Error("Not authorized to view this payment");
      }
    }

    return payment;
  },
});

/**
 * Get seller's Stripe Connect account status
 */
export const getConnectAccountStatus = query({
  args: {
    sellerId: v.optional(v.id("sellers")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Get seller record
    let seller;
    if (args.sellerId) {
      seller = await ctx.db.get(args.sellerId);
    } else {
      seller = await ctx.db
        .query("sellers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    if (!seller) {
      return { hasAccount: false, isOnboarded: false };
    }

    // Check if seller has a Stripe Connect account
    const connectAccount = await ctx.db
      .query("stripeConnectAccounts")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .first();

    if (!connectAccount) {
      return { hasAccount: false, isOnboarded: false };
    }

    return {
      hasAccount: true,
      accountId: connectAccount.stripeAccountId,
      isOnboarded: connectAccount.chargesEnabled && connectAccount.payoutsEnabled,
      chargesEnabled: connectAccount.chargesEnabled,
      payoutsEnabled: connectAccount.payoutsEnabled,
      detailsSubmitted: connectAccount.detailsSubmitted,
    };
  },
});

/**
 * Internal query to get order for checkout
 */
export const getOrderForCheckout = internalQuery({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      return null;
    }

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    // Get product details for each item
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    };
  },
});

/**
 * Internal query to get cart items for checkout
 */
export const getCartForCheckout = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (cartItems.length === 0) {
      return null;
    }

    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return itemsWithProducts.filter((item) => item.product !== null);
  },
});

/**
 * Get payment details from database
 */
export const getPaymentDetails = query({
  args: {
    sessionId: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    let payment = null;

    if (args.sessionId) {
      payment = await ctx.db
        .query("stripePayments")
        .withIndex("by_checkout_session", (q) =>
          q.eq("stripeCheckoutSessionId", args.sessionId)
        )
        .first();
    } else if (args.paymentIntentId) {
      payment = await ctx.db
        .query("stripePayments")
        .withIndex("by_stripe_payment_intent", (q) =>
          q.eq("stripePaymentIntentId", args.paymentIntentId as string)
        )
        .first();
    }

    if (!payment) {
      return null;
    }

    // Verify ownership or admin
    if (payment.userId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw new Error("Not authorized to view this payment");
      }
    }

    // Get order details if available
    let order = null;
    if (payment.orderId) {
      order = await ctx.db.get(payment.orderId);
    }

    return {
      ...payment,
      order,
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create or update Stripe customer record
 */
export const upsertStripeCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
    email: v.optional(v.string()),
    defaultPaymentMethodId: v.optional(v.string()),
    tenantId: v.optional(v.id("tenants")),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const now = Date.now();

    let existingCustomer;

    if (args.tenantId) {
      existingCustomer = await ctx.db
        .query("stripeCustomers")
        .withIndex("by_user_tenant", (q) =>
          q.eq("userId", userId).eq("tenantId", args.tenantId)
        )
        .first();
    } else {
      existingCustomer = await ctx.db
        .query("stripeCustomers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    if (existingCustomer) {
      await ctx.db.patch(existingCustomer._id, {
        stripeCustomerId: args.stripeCustomerId,
        email: args.email,
        defaultPaymentMethodId: args.defaultPaymentMethodId,
        metadata: args.metadata,
        updatedAt: now,
      });

      return existingCustomer._id;
    }

    const customerId = await ctx.db.insert("stripeCustomers", {
      userId,
      tenantId: args.tenantId,
      stripeCustomerId: args.stripeCustomerId,
      email: args.email,
      defaultPaymentMethodId: args.defaultPaymentMethodId,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return customerId;
  },
});

/**
 * Create a payment record
 */
export const createPaymentRecord = mutation({
  args: {
    stripeCustomerId: v.string(),
    stripePaymentIntentId: v.string(),
    stripeCheckoutSessionId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    orderId: v.optional(v.id("orders")),
    tenantId: v.optional(v.id("tenants")),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const now = Date.now();

    const paymentId = await ctx.db.insert("stripePayments", {
      tenantId: args.tenantId,
      userId,
      orderId: args.orderId,
      stripeCustomerId: args.stripeCustomerId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      amount: args.amount,
      currency: args.currency,
      status: "pending",
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

/**
 * Update payment status (internal use)
 */
export const updatePaymentStatus = internalMutation({
  args: {
    stripePaymentIntentId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    status: paymentStatusValidator,
    stripeChargeId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    failureCode: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let payment = null;

    if (args.stripePaymentIntentId) {
      payment = await ctx.db
        .query("stripePayments")
        .withIndex("by_stripe_payment_intent", (q) =>
          q.eq("stripePaymentIntentId", args.stripePaymentIntentId as string)
        )
        .first();
    } else if (args.stripeCheckoutSessionId) {
      payment = await ctx.db
        .query("stripePayments")
        .withIndex("by_checkout_session", (q) =>
          q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId)
        )
        .first();
    }

    if (!payment) {
      console.warn("Payment not found for update");
      return null;
    }

    const now = Date.now();

    await ctx.db.patch(payment._id, {
      status: args.status,
      stripeChargeId: args.stripeChargeId,
      receiptUrl: args.receiptUrl,
      paymentMethod: args.paymentMethod,
      failureCode: args.failureCode,
      failureMessage: args.failureMessage,
      updatedAt: now,
    });

    // If payment succeeded and has an order, update order status
    if (args.status === "succeeded" && payment.orderId) {
      const order = await ctx.db.get(payment.orderId);
      if (order && order.status === "pending") {
        await ctx.db.patch(payment.orderId, {
          status: "confirmed",
          paidAt: now,
          updatedAt: now,
        });
      }
    }

    return payment._id;
  },
});

/**
 * Record a webhook event
 */
export const recordWebhookEvent = internalMutation({
  args: {
    stripeEventId: v.string(),
    type: v.string(),
    payload: v.optional(v.string()), // Security fix (S5): replaced v.any(); payload is JSON-serialized
  },
  handler: async (ctx, args) => {
    const existingEvent = await ctx.db
      .query("stripeWebhookEvents")
      .withIndex("by_stripe_event", (q) =>
        q.eq("stripeEventId", args.stripeEventId)
      )
      .first();

    if (existingEvent) {
      return { alreadyProcessed: true, eventId: existingEvent._id };
    }

    const eventId = await ctx.db.insert("stripeWebhookEvents", {
      stripeEventId: args.stripeEventId,
      type: args.type,
      processed: false,
      payload: args.payload,
      createdAt: Date.now(),
    });

    return { alreadyProcessed: false, eventId };
  },
});

/**
 * Mark webhook event as processed
 */
export const markWebhookProcessed = internalMutation({
  args: {
    eventId: v.id("stripeWebhookEvents"),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      processed: true,
      processedAt: Date.now(),
      error: args.error,
    });
  },
});

/**
 * Create Stripe Connect account record
 */
export const createConnectAccountRecord = internalMutation({
  args: {
    sellerId: v.id("sellers"),
    stripeAccountId: v.string(),
    accountType: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const accountId = await ctx.db.insert("stripeConnectAccounts", {
      sellerId: args.sellerId,
      stripeAccountId: args.stripeAccountId,
      accountType: args.accountType as "standard" | "express" | "custom",
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      onboardingComplete: false,
      createdAt: now,
      updatedAt: now,
    });

    return accountId;
  },
});

/**
 * Update Stripe Connect account status
 */
export const updateConnectAccountStatus = internalMutation({
  args: {
    stripeAccountId: v.string(),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    detailsSubmitted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db
      .query("stripeConnectAccounts")
      .withIndex("by_stripe_account", (q) =>
        q.eq("stripeAccountId", args.stripeAccountId)
      )
      .first();

    if (!account) {
      console.warn("Connect account not found:", args.stripeAccountId);
      return null;
    }

    await ctx.db.patch(account._id, {
      chargesEnabled: args.chargesEnabled,
      payoutsEnabled: args.payoutsEnabled,
      detailsSubmitted: args.detailsSubmitted,
      updatedAt: Date.now(),
    });

    return account._id;
  },
});

/**
 * Internal mutation to update payment status from action
 */
export const updatePaymentStatusInternal = internalMutation({
  args: {
    paymentId: v.id("stripePayments"),
    status: paymentStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create order from checkout session
 */
export const createOrderFromCheckout = internalMutation({
  args: {
    userId: v.id("users"),
    sessionId: v.string(),
    paymentIntentId: v.string(),
    amountTotal: v.number(),
    currency: v.string(),
    customerEmail: v.optional(v.string()),
    metadata: metadataValidator, // Security fix (S5): replaced v.any()
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // BUG FIX B5: Use shared crypto-secure order number generator
    // instead of inline Math.random() which is not cryptographically secure
    const orderNumber = generateOrderNumber();

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      orderNumber,
      status: "confirmed",
      subtotal: args.amountTotal,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: args.amountTotal,
      currency: args.currency,
      paidAt: now,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });

    // Create payment record
    await ctx.db.insert("stripePayments", {
      userId: args.userId,
      orderId,
      stripePaymentIntentId: args.paymentIntentId,
      stripeCheckoutSessionId: args.sessionId,
      stripeCustomerId: "", // Will be updated from webhook
      amount: args.amountTotal,
      currency: args.currency,
      status: "succeeded",
      createdAt: now,
      updatedAt: now,
    });

    // Clear user's cart
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    return { orderId, orderNumber };
  },
});

// ============================================================================
// Actions (for Stripe API calls)
// ============================================================================

/**
 * Create a Stripe checkout session
 */
export const createCheckoutSession = action({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    successUrl: v.string(),
    cancelUrl: v.string(),
    customerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string }> => {
    const stripe = getStripeClient();

    // Get product details for each item
    const lineItems: CheckoutLineItem[] = [];

    for (const item of args.items) {
      const product = await ctx.runQuery(internal.functions.products.getProductById, {
        productId: item.productId,
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      lineItems.push({
        name: product.name,
        description: product.description,
        imageUrl: product.images?.[0],
        priceInCents: dollarsToCents(product.price),
        quantity: item.quantity,
        productId: item.productId,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: buildStripeLineItems(lineItems),
      success_url: `${args.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: args.cancelUrl,
      customer_email: args.customerEmail,
      metadata: {
        productIds: args.items.map((i) => i.productId).join(","),
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return {
      sessionId: session.id,
      url: session.url,
    };
  },
});

/**
 * Create Stripe Connect account for seller
 */
export const createConnectAccount = action({
  args: {
    sellerId: v.id("sellers"),
    email: v.string(),
    businessType: v.optional(v.string()),
    returnUrl: v.string(),
    refreshUrl: v.string(),
  },
  handler: async (ctx, args): Promise<{ accountId: string; onboardingUrl: string }> => {
    const stripe = getStripeClient();

    // Create Express Connect account
    const account = await stripe.accounts.create({
      type: "express",
      email: args.email,
      business_type: (args.businessType as Stripe.AccountCreateParams.BusinessType) || "individual",
      capabilities: getConnectCapabilities("express"),
      metadata: {
        sellerId: args.sellerId,
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: args.refreshUrl,
      return_url: args.returnUrl,
      type: "account_onboarding",
    });

    // Store the account record
    await ctx.runMutation(internal.functions.stripe.createConnectAccountRecord, {
      sellerId: args.sellerId,
      stripeAccountId: account.id,
      accountType: "express",
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  },
});

/**
 * Create Stripe dashboard link for seller
 */
export const createPayoutLink = action({
  args: {
    sellerId: v.id("sellers"),
  },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const stripe = getStripeClient();

    // Get the Connect account
    const account = await ctx.runQuery(internal.functions.stripe.getConnectAccountBySeller, {
      sellerId: args.sellerId,
    });

    if (!account) {
      throw new Error("Stripe Connect account not found");
    }

    // Create login link for Express dashboard
    const loginLink = await stripe.accounts.createLoginLink(account.stripeAccountId);

    return { url: loginLink.url };
  },
});

/**
 * Internal query to get Connect account by seller
 */
export const getConnectAccountBySeller = internalQuery({
  args: {
    sellerId: v.id("sellers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stripeConnectAccounts")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .first();
  },
});

/**
 * Process a refund
 */
export const processRefund = action({
  args: {
    paymentId: v.id("stripePayments"),
    amount: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; refundId?: string }> => {
    const stripe = getStripeClient();

    // Get the payment record
    const payment = await ctx.runQuery(internal.functions.stripe.getPaymentById, {
      paymentId: args.paymentId,
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (!payment.stripePaymentIntentId) {
      throw new Error("No payment intent found for this payment");
    }

    // Create refund
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: payment.stripePaymentIntentId,
    };

    if (args.amount) {
      refundParams.amount = args.amount;
    }

    if (args.reason) {
      refundParams.reason = args.reason as Stripe.RefundCreateParams.Reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    // Update payment status
    await ctx.runMutation(internal.functions.stripe.updatePaymentStatusInternal, {
      paymentId: args.paymentId,
      status: args.amount && args.amount < payment.amount ? "partially_refunded" : "refunded",
    });

    return {
      success: true,
      refundId: refund.id,
    };
  },
});

/**
 * Internal query to get payment by ID
 */
export const getPaymentById = internalQuery({
  args: {
    paymentId: v.id("stripePayments"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paymentId);
  },
});

/**
 * Get payment details from Stripe
 */
export const getStripePaymentDetails = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    receiptUrl?: string;
  }> => {
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.retrieve(args.paymentIntentId, {
      expand: ["latest_charge"],
    });

    const charge = paymentIntent.latest_charge as Stripe.Charge | null;

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      receiptUrl: charge?.receipt_url ?? undefined,
    };
  },
});

/**
 * Verify checkout session and get details
 */
export const verifyCheckoutSession = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{
    valid: boolean;
    session?: {
      id: string;
      paymentStatus: string;
      paymentIntentId?: string;
      customerEmail?: string;
      amountTotal?: number;
      currency?: string;
    };
  }> => {
    const stripe = getStripeClient();

    try {
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);

      return {
        valid: true,
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          paymentIntentId: session.payment_intent as string | undefined,
          customerEmail: session.customer_email ?? undefined,
          amountTotal: session.amount_total ?? undefined,
          currency: session.currency ?? undefined,
        },
      };
    } catch (error) {
      console.error("Failed to verify checkout session:", error);
      return { valid: false };
    }
  },
});
