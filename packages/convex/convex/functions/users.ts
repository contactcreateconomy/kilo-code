import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { userRoleValidator } from "../schema";
import { checkRateLimitWithDb } from "../lib/security";
import { authenticatedMutation, adminMutation } from "../lib/middleware";
import { createError, ErrorCode } from "../lib/errors";

// Domain modules
import {
  getProfileByUserId,
  getSellerByUserId,
  upsertProfile,
  searchProfiles,
} from "../lib/users/users.repository";
import { assertTenantAdmin } from "../lib/users/users.policies";
import {
  buildProfilePatch,
  buildSellerProfilePatch,
} from "../lib/users/users.service";

/**
 * User Management Functions
 *
 * Queries and mutations for managing user profiles and roles
 * in the Createconomy platform.
 */

// ============================================================================
// Queries
// ============================================================================

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const profile = await getProfileByUserId(ctx, userId);

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerificationTime: user.emailVerificationTime,
      profile: profile
        ? {
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            phone: profile.phone,
            address: profile.address,
            preferences: profile.preferences,
            defaultRole: profile.defaultRole,
            isBanned: profile.isBanned,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }
        : null,
    };
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const profile = await getProfileByUserId(ctx, args.userId);

    return {
      id: user._id,
      name: user.name,
      image: user.image,
      profile: profile
        ? {
            displayName: profile.displayName,
            bio: profile.bio,
            avatarUrl: profile.avatarUrl,
            defaultRole: profile.defaultRole,
            createdAt: profile.createdAt,
          }
        : null,
    };
  },
});

export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await getProfileByUserId(ctx, userId);
    return profile?.defaultRole ?? "customer";
  },
});

export const getUserTenantRole = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const userTenant = await ctx.db
      .query("userTenants")
      .withIndex("by_user_tenant", (q) =>
        q.eq("userId", userId).eq("tenantId", args.tenantId)
      )
      .first();

    return userTenant?.role ?? null;
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await getProfileByUserId(ctx, userId);
    return profile?.defaultRole === "admin";
  },
});

export const isSeller = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await getProfileByUserId(ctx, userId);
    return profile?.defaultRole === "seller";
  },
});

// ============================================================================
// Mutations
// ============================================================================

export const updateUserProfile = authenticatedMutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
    preferences: v.optional(
      v.object({
        emailNotifications: v.optional(v.boolean()),
        marketingEmails: v.optional(v.boolean()),
        language: v.optional(v.string()),
        currency: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const patch = buildProfilePatch(args);
    return await upsertProfile(ctx, ctx.userId, patch, now);
  },
});

export const setUserRole = adminMutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const targetProfile = await getProfileByUserId(ctx, args.userId);
    const now = Date.now();

    if (targetProfile) {
      await ctx.db.patch(targetProfile._id, {
        defaultRole: args.role,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        defaultRole: args.role,
        isBanned: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

export const setUserTenantRole = authenticatedMutation({
  args: {
    userId: v.id("users"),
    tenantId: v.id("tenants"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    await assertTenantAdmin(ctx, ctx.userId, args.tenantId);

    const now = Date.now();

    const existingUserTenant = await ctx.db
      .query("userTenants")
      .withIndex("by_user_tenant", (q) =>
        q.eq("userId", args.userId).eq("tenantId", args.tenantId)
      )
      .first();

    if (existingUserTenant) {
      await ctx.db.patch(existingUserTenant._id, {
        role: args.role,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userTenants", {
        userId: args.userId,
        tenantId: args.tenantId,
        role: args.role,
        isActive: true,
        joinedAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

export const requestSellerRole = authenticatedMutation({
  args: {
    businessName: v.string(),
    businessEmail: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkRateLimitWithDb(ctx, `requestSellerRole:${ctx.userId}`, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
      action: "request_seller_role",
    });

    const profile = await getProfileByUserId(ctx, ctx.userId);

    if (profile?.defaultRole === "seller") {
      throw createError(ErrorCode.CONFLICT, "User already has seller role");
    }

    const existingSeller = await getSellerByUserId(ctx, ctx.userId);

    if (existingSeller) {
      if (existingSeller.isApproved) {
        throw createError(ErrorCode.ALREADY_EXISTS, "Seller account already approved");
      }
      throw createError(ErrorCode.ALREADY_EXISTS, "Seller request already pending approval");
    }

    const now = Date.now();

    await ctx.db.insert("sellers", {
      userId: ctx.userId,
      businessName: args.businessName,
      businessEmail: args.businessEmail,
      description: args.description,
      stripeOnboarded: false,
      isApproved: false,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    });

    if (!profile) {
      await ctx.db.insert("userProfiles", {
        userId: ctx.userId,
        defaultRole: "customer",
        isBanned: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      status: "pending" as const,
      message: "Your seller request has been submitted and is pending admin approval.",
    };
  },
});

export const deleteAccount = authenticatedMutation({
  args: {},
  handler: async (ctx) => {
    const profile = await getProfileByUserId(ctx, ctx.userId);
    const now = Date.now();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isBanned: true,
        bannedAt: now,
        bannedReason: "Account deleted by user",
        updatedAt: now,
      });
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
      });
    }

    return true;
  },
});

// ============================================================================
// Seller Profile Management
// ============================================================================

export const getMySellerProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const seller = await getSellerByUserId(ctx, userId);
    if (!seller) return null;

    const user = await ctx.db.get(userId);

    return {
      ...seller,
      user: user
        ? { id: user._id, name: user.name, email: user.email, image: user.image }
        : null,
    };
  },
});

export const updateSellerProfile = authenticatedMutation({
  args: {
    businessName: v.optional(v.string()),
    businessEmail: v.optional(v.string()),
    businessPhone: v.optional(v.string()),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    twitterHandle: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    businessAddress: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postalCode: v.optional(v.string()),
        country: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const seller = await getSellerByUserId(ctx, ctx.userId);
    if (!seller) {
      throw createError(ErrorCode.NOT_FOUND, "Seller profile not found");
    }

    const patch = buildSellerProfilePatch(args);

    await ctx.db.patch(seller._id, {
      ...patch,
      updatedAt: Date.now(),
    } as never);

    return true;
  },
});

export const getSellerSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const seller = await getSellerByUserId(ctx, userId);
    if (!seller) return null;

    return seller.metadata ?? {};
  },
});

export const updateSellerSettings = authenticatedMutation({
  args: {
    settings: v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null())),
  },
  handler: async (ctx, args) => {
    const seller = await getSellerByUserId(ctx, ctx.userId);
    if (!seller) {
      throw createError(ErrorCode.NOT_FOUND, "Seller profile not found");
    }

    const existingMetadata = seller.metadata ?? {};
    const merged = { ...existingMetadata, ...args.settings };

    await ctx.db.patch(seller._id, {
      metadata: merged,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// ============================================================================
// Search
// ============================================================================

export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const matches = await searchProfiles(ctx, args.query, limit);

    return matches.map((p) => ({
      id: p.userId,
      name: p.displayName ?? "Anonymous",
      username: p.username ?? String(p.userId),
      avatarUrl: p.avatarUrl ?? null,
    }));
  },
});
