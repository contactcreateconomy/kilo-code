import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * Webhook Endpoints Functions
 *
 * Manage seller-configured outbound webhook endpoints and delivery logs.
 * Gumroad equivalent: Webhook/Ping integration for order notifications.
 */

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a random webhook secret for HMAC signing.
 */
function generateWebhookSecret(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let secret = "whsec_";
  for (let i = 0; i < 32; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}

/** Valid webhook event types */
const VALID_EVENTS = [
  "order.completed",
  "order.refunded",
  "order.disputed",
  "subscription.created",
  "subscription.cancelled",
  "subscription.updated",
  "product.created",
  "product.updated",
  "review.created",
  "license.created",
  "license.disabled",
] as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all webhook endpoints for the current seller.
 */
export const getWebhookEndpoints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const endpoints = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

    return { items: endpoints };
  },
});

/**
 * Get a single webhook endpoint by ID.
 */
export const getWebhookEndpoint = query({
  args: {
    endpointId: v.id("webhookEndpoints"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint || endpoint.sellerId !== userId) {
      return null;
    }

    return endpoint;
  },
});

/**
 * Get recent deliveries for a webhook endpoint.
 */
export const getWebhookDeliveries = query({
  args: {
    endpointId: v.id("webhookEndpoints"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint || endpoint.sellerId !== userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 20;

    const deliveries = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_endpoint", (q) => q.eq("endpointId", args.endpointId))
      .order("desc")
      .take(limit);

    return { items: deliveries };
  },
});

/**
 * Get list of available webhook event types.
 */
export const getAvailableEvents = query({
  args: {},
  handler: async () => {
    return VALID_EVENTS.map((event) => ({
      value: event,
      label: event
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
    }));
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a webhook endpoint (seller only).
 */
export const createWebhookEndpoint = mutation({
  args: {
    url: v.string(),
    events: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    // Verify seller role
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.defaultRole !== "seller" && profile.defaultRole !== "admin")) {
      throw createError(ErrorCode.UNAUTHORIZED, "Seller role required");
    }

    // Validate URL
    try {
      const url = new URL(args.url);
      if (url.protocol !== "https:") {
        throw createError(ErrorCode.INVALID_INPUT, "Webhook URL must use HTTPS");
      }
    } catch {
      throw createError(ErrorCode.INVALID_INPUT, "Invalid webhook URL");
    }

    // Validate events
    if (args.events.length === 0) {
      throw createError(ErrorCode.INVALID_INPUT, "At least one event must be selected");
    }

    const validEventSet = new Set<string>(VALID_EVENTS);
    for (const event of args.events) {
      if (!validEventSet.has(event)) {
        throw createError(ErrorCode.INVALID_INPUT, `Invalid event type: ${event}`);
      }
    }

    // Limit endpoints per seller
    const existingEndpoints = await ctx.db
      .query("webhookEndpoints")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .collect();

    if (existingEndpoints.length >= 10) {
      throw createError(
        ErrorCode.RATE_LIMITED,
        "Maximum of 10 webhook endpoints per seller"
      );
    }

    const now = Date.now();
    const secret = generateWebhookSecret();

    const endpointId = await ctx.db.insert("webhookEndpoints", {
      sellerId: userId,
      url: args.url,
      events: args.events,
      secret,
      isActive: true,
      failureCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { endpointId, secret };
  },
});

/**
 * Update a webhook endpoint (seller only).
 */
export const updateWebhookEndpoint = mutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
    url: v.optional(v.string()),
    events: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint) {
      throw createError(ErrorCode.NOT_FOUND, "Endpoint not found");
    }

    if (endpoint.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    // Validate URL if changed
    if (args.url) {
      try {
        const url = new URL(args.url);
        if (url.protocol !== "https:") {
          throw createError(ErrorCode.INVALID_INPUT, "Webhook URL must use HTTPS");
        }
      } catch {
        throw createError(ErrorCode.INVALID_INPUT, "Invalid webhook URL");
      }
    }

    // Validate events if changed
    if (args.events) {
      if (args.events.length === 0) {
        throw createError(ErrorCode.INVALID_INPUT, "At least one event must be selected");
      }
      const validEventSet = new Set<string>(VALID_EVENTS);
      for (const event of args.events) {
        if (!validEventSet.has(event)) {
          throw createError(ErrorCode.INVALID_INPUT, `Invalid event type: ${event}`);
        }
      }
    }

    const { endpointId: _id, ...updates } = args;

    await ctx.db.patch(args.endpointId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete a webhook endpoint (seller only).
 */
export const deleteWebhookEndpoint = mutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint) {
      throw createError(ErrorCode.NOT_FOUND, "Endpoint not found");
    }

    if (endpoint.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    // Delete all delivery logs first
    const deliveries = await ctx.db
      .query("webhookDeliveries")
      .withIndex("by_endpoint", (q) => q.eq("endpointId", args.endpointId))
      .collect();

    for (const delivery of deliveries) {
      await ctx.db.delete(delivery._id);
    }

    await ctx.db.delete(args.endpointId);

    return true;
  },
});

/**
 * Regenerate the webhook secret (seller only).
 */
export const regenerateWebhookSecret = mutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const endpoint = await ctx.db.get(args.endpointId);
    if (!endpoint) {
      throw createError(ErrorCode.NOT_FOUND, "Endpoint not found");
    }

    if (endpoint.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    const newSecret = generateWebhookSecret();

    await ctx.db.patch(args.endpointId, {
      secret: newSecret,
      updatedAt: Date.now(),
    });

    return { secret: newSecret };
  },
});

/**
 * Record a webhook delivery attempt (internal use).
 */
export const recordWebhookDelivery = mutation({
  args: {
    endpointId: v.id("webhookEndpoints"),
    event: v.string(),
    payload: v.string(),
    statusCode: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const deliveryId = await ctx.db.insert("webhookDeliveries", {
      endpointId: args.endpointId,
      event: args.event,
      payload: args.payload,
      statusCode: args.statusCode,
      responseBody: args.responseBody,
      success: args.success,
      deliveredAt: now,
      retryCount: 0,
      createdAt: now,
    });

    // Update endpoint stats
    const endpoint = await ctx.db.get(args.endpointId);
    if (endpoint) {
      if (args.success) {
        await ctx.db.patch(args.endpointId, {
          failureCount: 0,
          lastDeliveredAt: now,
          updatedAt: now,
        });
      } else {
        const newFailureCount = endpoint.failureCount + 1;
        await ctx.db.patch(args.endpointId, {
          failureCount: newFailureCount,
          updatedAt: now,
          // Auto-disable after 10 consecutive failures
          ...(newFailureCount >= 10 ? { isActive: false } : {}),
        });
      }
    }

    return deliveryId;
  },
});
