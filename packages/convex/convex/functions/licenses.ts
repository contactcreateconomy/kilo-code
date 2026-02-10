import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";

/**
 * License Key Functions
 *
 * Generate, verify, and manage license keys for digital products.
 * Gumroad equivalent: License key generation and verification API.
 */

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate a random license key in the format XXXX-XXXX-XXXX-XXXX.
 */
function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing chars: I,O,0,1
  const segments: string[] = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return segments.join("-");
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Get licenses for the current user (buyer view).
 */
export const getMyLicenses = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const licenses = await ctx.db
      .query("licenses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(limit);

    // Enrich with product details
    const items = await Promise.all(
      licenses.map(async (license) => {
        const product = await ctx.db.get(license.productId);
        return {
          ...license,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
              }
            : null,
        };
      })
    );

    return { items };
  },
});

/**
 * Get licenses for a product (seller view).
 */
export const getProductLicenses = query({
  args: {
    productId: v.id("products"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    if (product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    const limit = args.limit ?? 50;

    const licenses = await ctx.db
      .query("licenses")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .take(limit);

    // Enrich with user info
    const items = await Promise.all(
      licenses.map(async (license) => {
        const user = await ctx.db.get(license.userId);
        const profile = user
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first()
          : null;

        return {
          ...license,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                displayName: profile?.displayName,
              }
            : null,
        };
      })
    );

    return { items };
  },
});

/**
 * Verify a license key (public API).
 */
export const verifyLicense = query({
  args: {
    licenseKey: v.string(),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const license = await ctx.db
      .query("licenses")
      .withIndex("by_license_key", (q) => q.eq("licenseKey", args.licenseKey))
      .first();

    if (!license) {
      return {
        valid: false,
        message: "License key not found",
      };
    }

    // Optionally verify it's for the right product
    if (args.productId && license.productId !== args.productId) {
      return {
        valid: false,
        message: "License key is not valid for this product",
      };
    }

    if (license.isDisabled) {
      return {
        valid: false,
        message: license.disabledReason ?? "License key has been disabled",
      };
    }

    if (license.expiresAt && Date.now() > license.expiresAt) {
      return {
        valid: false,
        message: "License key has expired",
      };
    }

    if (license.currentActivations >= license.maxActivations) {
      return {
        valid: false,
        message: `Maximum activations reached (${license.maxActivations})`,
      };
    }

    const product = await ctx.db.get(license.productId);

    return {
      valid: true,
      message: "License key is valid",
      license: {
        productId: license.productId,
        productName: product?.name,
        maxActivations: license.maxActivations,
        currentActivations: license.currentActivations,
        expiresAt: license.expiresAt,
        createdAt: license.createdAt,
      },
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Generate a license key for a completed order (called after purchase).
 * Typically called internally after order confirmation.
 */
export const generateLicense = mutation({
  args: {
    productId: v.id("products"),
    orderId: v.id("orders"),
    userId: v.id("users"),
    maxActivations: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const callingUserId = await getAuthUserId(ctx);
    if (!callingUserId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    // Only seller or admin can generate licenses
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", callingUserId))
      .first();

    if (
      product.sellerId !== callingUserId &&
      profile?.defaultRole !== "admin"
    ) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    // Check for existing license for this order + product combo
    const existingLicenses = await ctx.db
      .query("licenses")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .collect();

    if (existingLicenses.length > 0) {
      // Return existing license
      return existingLicenses[0]!._id;
    }

    // Generate a unique license key
    let licenseKey: string;
    let attempts = 0;
    do {
      licenseKey = generateLicenseKey();
      const existing = await ctx.db
        .query("licenses")
        .withIndex("by_license_key", (q) => q.eq("licenseKey", licenseKey))
        .first();
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw createError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to generate unique license key"
      );
    }

    const now = Date.now();

    const licenseId = await ctx.db.insert("licenses", {
      productId: args.productId,
      orderId: args.orderId,
      userId: args.userId,
      licenseKey,
      maxActivations: args.maxActivations ?? 5,
      currentActivations: 0,
      isDisabled: false,
      expiresAt: args.expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    return licenseId;
  },
});

/**
 * Activate a license key (increment activation count).
 */
export const activateLicense = mutation({
  args: {
    licenseKey: v.string(),
  },
  handler: async (ctx, args) => {
    const license = await ctx.db
      .query("licenses")
      .withIndex("by_license_key", (q) => q.eq("licenseKey", args.licenseKey))
      .first();

    if (!license) {
      throw createError(ErrorCode.NOT_FOUND, "License key not found");
    }

    if (license.isDisabled) {
      throw createError(
        ErrorCode.FORBIDDEN,
        license.disabledReason ?? "License key has been disabled"
      );
    }

    if (license.expiresAt && Date.now() > license.expiresAt) {
      throw createError(ErrorCode.FORBIDDEN, "License key has expired");
    }

    if (license.currentActivations >= license.maxActivations) {
      throw createError(
        ErrorCode.RATE_LIMITED,
        `Maximum activations reached (${license.maxActivations})`
      );
    }

    await ctx.db.patch(license._id, {
      currentActivations: license.currentActivations + 1,
      lastActivatedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      activationsRemaining:
        license.maxActivations - license.currentActivations - 1,
    };
  },
});

/**
 * Disable a license key (seller only).
 */
export const disableLicense = mutation({
  args: {
    licenseId: v.id("licenses"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const license = await ctx.db.get(args.licenseId);
    if (!license) {
      throw createError(ErrorCode.NOT_FOUND, "License not found");
    }

    const product = await ctx.db.get(license.productId);
    if (!product || product.sellerId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
      }
    }

    await ctx.db.patch(args.licenseId, {
      isDisabled: true,
      disabledReason: args.reason ?? "Disabled by seller",
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Re-enable a disabled license key (seller only).
 */
export const enableLicense = mutation({
  args: {
    licenseId: v.id("licenses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const license = await ctx.db.get(args.licenseId);
    if (!license) {
      throw createError(ErrorCode.NOT_FOUND, "License not found");
    }

    const product = await ctx.db.get(license.productId);
    if (!product || product.sellerId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
      }
    }

    await ctx.db.patch(args.licenseId, {
      isDisabled: false,
      disabledReason: undefined,
      updatedAt: Date.now(),
    });

    return true;
  },
});
