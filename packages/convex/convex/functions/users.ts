import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { userRoleValidator } from "../schema";
import { checkRateLimitWithDb } from "../lib/security";

/**
 * User Management Functions
 *
 * Queries and mutations for managing user profiles and roles
 * in the Createconomy platform.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get the currently authenticated user with their profile
 *
 * @returns User data with profile or null if not authenticated
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

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

/**
 * Get a user by their ID
 *
 * @param userId - The user's ID
 * @returns User data with profile or null if not found
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Return limited public information
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

/**
 * Get the current user's role
 *
 * @returns The user's role or null if not authenticated
 */
export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile?.defaultRole ?? "customer";
  },
});

/**
 * Get the current user's role for a specific tenant
 *
 * @param tenantId - The tenant ID
 * @returns The user's role in the tenant or null
 */
export const getUserTenantRole = query({
  args: {
    tenantId: v.id("tenants"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const userTenant = await ctx.db
      .query("userTenants")
      .withIndex("by_user_tenant", (q) =>
        q.eq("userId", userId).eq("tenantId", args.tenantId)
      )
      .first();

    return userTenant?.role ?? null;
  },
});

/**
 * Check if the current user is an admin
 *
 * @returns True if user is admin
 */
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile?.defaultRole === "admin";
  },
});

/**
 * Check if the current user is a seller
 *
 * @returns True if user is seller
 */
export const isSeller = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile?.defaultRole === "seller";
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create or update user profile
 * Called after user registration or when updating profile
 *
 * @param displayName - Display name
 * @param bio - User bio
 * @param avatarUrl - Avatar URL
 * @param phone - Phone number
 * @param address - Address object
 * @param preferences - User preferences
 */
export const updateUserProfile = mutation({
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const now = Date.now();

    // Check if profile exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        ...(args.displayName !== undefined && { displayName: args.displayName }),
        ...(args.bio !== undefined && { bio: args.bio }),
        ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
        ...(args.phone !== undefined && { phone: args.phone }),
        ...(args.address !== undefined && { address: args.address }),
        ...(args.preferences !== undefined && { preferences: args.preferences }),
        updatedAt: now,
      });

      return existingProfile._id;
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId,
        displayName: args.displayName,
        bio: args.bio,
        avatarUrl: args.avatarUrl,
        phone: args.phone,
        address: args.address,
        preferences: args.preferences,
        defaultRole: "customer",
        isBanned: false,
        createdAt: now,
        updatedAt: now,
      });

      return profileId;
    }
  },
});

/**
 * Set user role (admin only)
 *
 * @param userId - Target user ID
 * @param role - New role to assign
 */
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required");
    }

    // Check if current user is admin
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", currentUserId))
      .first();

    if (!currentProfile || currentProfile.defaultRole !== "admin") {
      throw new Error("Admin role required");
    }

    // Get target user's profile
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (targetProfile) {
      await ctx.db.patch(targetProfile._id, {
        defaultRole: args.role,
        updatedAt: now,
      });
    } else {
      // Create profile with the specified role
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

/**
 * Set user role for a specific tenant (admin only)
 *
 * @param userId - Target user ID
 * @param tenantId - Tenant ID
 * @param role - New role to assign
 */
export const setUserTenantRole = mutation({
  args: {
    userId: v.id("users"),
    tenantId: v.id("tenants"),
    role: userRoleValidator,
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required");
    }

    // Check if current user is admin in this tenant
    const currentUserTenant = await ctx.db
      .query("userTenants")
      .withIndex("by_user_tenant", (q) =>
        q.eq("userId", currentUserId).eq("tenantId", args.tenantId)
      )
      .first();

    if (!currentUserTenant || currentUserTenant.role !== "admin") {
      throw new Error("Admin role required for this tenant");
    }

    const now = Date.now();

    // Check if user-tenant relationship exists
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

/**
 * Request to become a seller
 *
 * BUG FIX B6: Previously this mutation directly upgraded the user's role to
 * "seller", bypassing any approval process. Now it creates a pending seller
 * record in the `sellers` table with `isApproved: false` and keeps the user's
 * role as "customer" until an admin approves the request. The admin can approve
 * sellers via the admin dashboard (sellers/pending page) or a dedicated
 * `approveSeller` mutation.
 *
 * @param businessName - The seller's business name
 * @param businessEmail - Optional business email
 * @param description - Optional business description
 * @returns Object with status and message
 */
export const requestSellerRole = mutation({
  args: {
    businessName: v.string(),
    businessEmail: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // A3: Rate limit seller role requests — 3 per hour per user.
    // Prevents abuse of the seller application flow.
    await checkRateLimitWithDb(ctx, `requestSellerRole:${userId}`, {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      action: "request_seller_role",
    });

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // BUG FIX B6: Check if the user already has a seller role — don't allow re-requesting
    if (profile?.defaultRole === "seller") {
      throw new Error("User already has seller role");
    }

    // BUG FIX B6: Check if there's already a pending (or active) seller record
    const existingSeller = await ctx.db
      .query("sellers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSeller) {
      if (existingSeller.isApproved) {
        throw new Error("Seller account already approved");
      }
      throw new Error("Seller request already pending approval");
    }

    const now = Date.now();

    // BUG FIX B6: Create a seller record with isApproved: false instead of
    // directly upgrading the user's role. The user's defaultRole stays as-is
    // until an admin approves the seller application.
    await ctx.db.insert("sellers", {
      userId,
      businessName: args.businessName,
      businessEmail: args.businessEmail,
      description: args.description,
      stripeOnboarded: false,
      isApproved: false,
      isActive: false,
      createdAt: now,
      updatedAt: now,
    });

    // Ensure the user has a profile (create one if missing)
    if (!profile) {
      await ctx.db.insert("userProfiles", {
        userId,
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

/**
 * Delete user account (soft delete)
 * Marks the user as banned and deactivates their profile
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isBanned: true,
        bannedAt: now,
        bannedReason: "Account deleted by user",
        updatedAt: now,
      });
    }

    // Deactivate all sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
      });
    }

    return true;
  },
});
