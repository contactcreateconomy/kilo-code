import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { SESSION_CONFIG } from "./auth.config";

/**
 * Convex Auth Configuration
 *
 * This module exports the auth object and helper functions for
 * authentication and session management in the Createconomy platform.
 * Supports cross-subdomain authentication across all platform sites.
 */

/**
 * Main auth object from Convex Auth
 * Provides authentication methods and session management
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [],
});

// ============================================================================
// Auth Helper Functions
// ============================================================================

/**
 * Get the currently authenticated user ID
 *
 * @param ctx - Query or mutation context
 * @returns The user ID if authenticated, null otherwise
 */
export async function getAuthenticatedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  return await getAuthUserId(ctx);
}

/**
 * Require authentication and return user ID
 * Throws an error if not authenticated
 *
 * @param ctx - Query or mutation context
 * @returns The authenticated user ID
 * @throws Error if not authenticated
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

/**
 * Get the current user with their profile
 *
 * @param ctx - Query or mutation context
 * @returns User with profile data or null
 */
export async function getCurrentUserWithProfile(ctx: QueryCtx | MutationCtx) {
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
    ...user,
    profile,
  };
}

/**
 * Check if the current user has a specific role
 *
 * @param ctx - Query or mutation context
 * @param role - Role to check for
 * @returns True if user has the role
 */
export async function hasRole(
  ctx: QueryCtx | MutationCtx,
  role: "customer" | "seller" | "admin" | "moderator"
): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    return false;
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  return profile?.defaultRole === role;
}

/**
 * Require a specific role
 * Throws an error if user doesn't have the role
 *
 * @param ctx - Query or mutation context
 * @param role - Required role
 * @throws Error if user doesn't have the role
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  role: "customer" | "seller" | "admin" | "moderator"
): Promise<void> {
  const userId = await requireAuth(ctx);

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!profile || profile.defaultRole !== role) {
    throw new Error(`Role '${role}' required`);
  }
}

/**
 * Require admin or moderator role
 * Throws an error if user is not admin or moderator
 *
 * @param ctx - Query or mutation context
 * @throws Error if user is not admin or moderator
 */
export async function requireAdminOrModerator(
  ctx: QueryCtx | MutationCtx
): Promise<void> {
  const userId = await requireAuth(ctx);

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!profile || (profile.defaultRole !== "admin" && profile.defaultRole !== "moderator")) {
    throw new Error("Admin or moderator role required");
  }
}

// ============================================================================
// Cross-Subdomain Session Management Functions
// ============================================================================

/**
 * Create a cross-subdomain session
 * Used for maintaining auth across different subdomains
 */
export const createSession = mutation({
  args: {
    tenantId: v.optional(v.id("tenants")),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Get user profile for role information
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Generate a secure session token
    const token = generateSessionToken();
    const now = Date.now();
    const expiresAt = now + SESSION_CONFIG.maxAge;

    const sessionId = await ctx.db.insert("sessions", {
      userId,
      token,
      tenantId: args.tenantId,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      expiresAt,
      isActive: true,
      createdAt: now,
      lastAccessedAt: now,
    });

    return {
      sessionId,
      token,
      expiresAt,
      userId,
      role: profile?.defaultRole || "customer",
      tenantId: args.tenantId,
    };
  },
});

/**
 * Validate a session token
 * Returns the session info if valid, null otherwise
 */
export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return null;
    }

    // Check if session is active and not expired
    if (!session.isActive || session.expiresAt < Date.now()) {
      return null;
    }

    // Get user profile for additional info
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .first();

    // Get user info
    const user = await ctx.db.get(session.userId);

    return {
      sessionId: session._id,
      userId: session.userId,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
      role: profile?.defaultRole || "customer",
      user: user ? {
        id: user._id,
        email: user.email,
        name: user.name,
      } : null,
      needsRefresh: session.expiresAt - Date.now() < SESSION_CONFIG.refreshThreshold,
    };
  },
});

/**
 * Validate session and check if it needs refresh
 * Used for cross-subdomain session validation
 */
export const validateSessionWithRefresh = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return { valid: false, needsRefresh: false, session: null };
    }

    const now = Date.now();

    // Check if session is active and not expired
    if (!session.isActive || session.expiresAt < now) {
      return { valid: false, needsRefresh: false, session: null };
    }

    // Check if session needs refresh (within refresh threshold)
    const needsRefresh = session.expiresAt - now < SESSION_CONFIG.refreshThreshold;

    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .first();

    // Get user info
    const user = await ctx.db.get(session.userId);

    return {
      valid: true,
      needsRefresh,
      session: {
        sessionId: session._id,
        userId: session.userId,
        tenantId: session.tenantId,
        expiresAt: session.expiresAt,
        role: profile?.defaultRole || "customer",
        user: user ? {
          id: user._id,
          email: user.email,
          name: user.name,
        } : null,
      },
    };
  },
});

/**
 * Refresh a session - extends expiry and updates last accessed time
 */
export const refreshSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return { success: false, session: null };
    }

    const now = Date.now();
    const newExpiresAt = now + SESSION_CONFIG.maxAge;

    // Generate new token for security (token rotation)
    const newToken = generateSessionToken();

    await ctx.db.patch(session._id, {
      token: newToken,
      lastAccessedAt: now,
      expiresAt: newExpiresAt,
    });

    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .first();

    return {
      success: true,
      session: {
        sessionId: session._id,
        token: newToken,
        userId: session.userId,
        tenantId: session.tenantId,
        expiresAt: newExpiresAt,
        role: profile?.defaultRole || "customer",
      },
    };
  },
});

/**
 * Update session last accessed time without token rotation
 * Used for regular activity updates
 */
export const touchSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return false;
    }

    await ctx.db.patch(session._id, {
      lastAccessedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Invalidate a session (logout)
 */
export const invalidateSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isActive: false,
      });
    }

    return true;
  },
});

/**
 * Invalidate all sessions for a user (logout everywhere)
 */
export const invalidateAllUserSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    for (const session of sessions) {
      await ctx.db.patch(session._id, {
        isActive: false,
      });
    }

    return { invalidatedCount: sessions.length };
  },
});

/**
 * Invalidate all sessions except current
 */
export const invalidateOtherSessions = mutation({
  args: {
    currentToken: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    let invalidatedCount = 0;
    for (const session of sessions) {
      if (session.token !== args.currentToken) {
        await ctx.db.patch(session._id, {
          isActive: false,
        });
        invalidatedCount++;
      }
    }

    return { invalidatedCount };
  },
});

/**
 * Get all active sessions for the current user
 */
export const getUserSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => q.eq("userId", userId).eq("isActive", true))
      .collect();

    // Filter out expired sessions and don't return the token
    return sessions
      .filter((s) => s.expiresAt > Date.now())
      .map((s) => ({
        id: s._id,
        tenantId: s.tenantId,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastAccessedAt: s.lastAccessedAt,
        expiresAt: s.expiresAt,
      }));
  },
});

/**
 * Get session by token (for internal use)
 */
export const getSessionByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return null;
    }

    return {
      id: session._id,
      userId: session.userId,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt,
    };
  },
});

/**
 * Clean up expired sessions (should be run periodically)
 */
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find expired sessions
    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    // Deactivate expired sessions
    for (const session of expiredSessions) {
      if (session.isActive) {
        await ctx.db.patch(session._id, {
          isActive: false,
        });
      }
    }

    return { cleanedCount: expiredSessions.length };
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a secure session token
 * Uses a combination of random values for security
 */
function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `sess_${token}_${Date.now()}`;
}

/**
 * Check if a session token is valid format
 */
export function isValidSessionToken(token: string): boolean {
  return token.startsWith("sess_") && token.length > 70;
}
