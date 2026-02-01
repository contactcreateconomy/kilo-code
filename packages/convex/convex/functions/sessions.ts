import { query, mutation, internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { SESSION_CONFIG } from "../auth.config";

/**
 * Session Management Functions for Cross-Subdomain Authentication
 *
 * This module provides comprehensive session management for the Createconomy platform,
 * enabling seamless authentication across all subdomains:
 * - createconomy.com (marketplace)
 * - discuss.createconomy.com (forum)
 * - console.createconomy.com (admin)
 * - seller.createconomy.com (seller)
 */

// ============================================================================
// Public Session Functions
// ============================================================================

/**
 * Create a new session with cross-domain support
 * Called after successful authentication
 */
export const createSession = mutation({
  args: {
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a secure session token
    const token = generateSessionToken();
    const now = Date.now();
    const expiresAt = now + SESSION_CONFIG.maxAge;

    // Get user profile for role information
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Create the session
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      token,
      tenantId: args.tenantId,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      expiresAt,
      isActive: true,
      createdAt: now,
      lastAccessedAt: now,
    });

    // Get user info
    const user = await ctx.db.get(args.userId);

    return {
      sessionId,
      token,
      expiresAt,
      userId: args.userId,
      role: profile?.defaultRole || "customer",
      tenantId: args.tenantId,
      user: user ? {
        id: user._id,
        email: user.email,
        name: user.name,
      } : null,
    };
  },
});

/**
 * Validate a session token
 * Returns session info if valid, null otherwise
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

    // Get user profile for role information
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
 * Refresh a session before expiry
 * Extends the session and optionally rotates the token
 */
export const refreshSession = mutation({
  args: {
    token: v.string(),
    rotateToken: v.optional(v.boolean()),
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

    // Optionally rotate token for security
    const newToken = args.rotateToken ? generateSessionToken() : session.token;

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

    // Get user info
    const user = await ctx.db.get(session.userId);

    return {
      success: true,
      session: {
        sessionId: session._id,
        token: newToken,
        userId: session.userId,
        tenantId: session.tenantId,
        expiresAt: newExpiresAt,
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
 * Revoke a session (logout)
 */
export const revokeSession = mutation({
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
      return { success: true, sessionId: session._id };
    }

    return { success: false, sessionId: null };
  },
});

/**
 * Revoke all sessions for a user (logout everywhere)
 */
export const revokeAllSessions = mutation({
  args: {
    userId: v.id("users"),
    exceptToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .collect();

    let revokedCount = 0;
    for (const session of sessions) {
      // Skip the current session if exceptToken is provided
      if (args.exceptToken && session.token === args.exceptToken) {
        continue;
      }

      await ctx.db.patch(session._id, {
        isActive: false,
      });
      revokedCount++;
    }

    return { success: true, revokedCount };
  },
});

/**
 * Get all active sessions for a user
 */
export const getActiveSessions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .collect();

    const now = Date.now();

    // Filter out expired sessions and format response
    return sessions
      .filter((s) => s.expiresAt > now)
      .map((s) => ({
        id: s._id,
        tenantId: s.tenantId,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastAccessedAt: s.lastAccessedAt,
        expiresAt: s.expiresAt,
        isCurrent: false, // Will be set by the client
      }));
  },
});

/**
 * Get session count for a user
 */
export const getSessionCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .collect();

    const now = Date.now();
    const activeSessions = sessions.filter((s) => s.expiresAt > now);

    return { count: activeSessions.length };
  },
});

// ============================================================================
// Internal Session Functions (for server-side use)
// ============================================================================

/**
 * Internal: Validate session without exposing sensitive data
 */
export const internalValidateSession = internalQuery({
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
      sessionId: session._id,
      userId: session.userId,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
    };
  },
});

/**
 * Internal: Create session for a user (used by auth handlers)
 */
export const internalCreateSession = internalMutation({
  args: {
    userId: v.id("users"),
    tenantId: v.optional(v.id("tenants")),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const token = generateSessionToken();
    const now = Date.now();
    const expiresAt = now + SESSION_CONFIG.maxAge;

    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      token,
      tenantId: args.tenantId,
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      expiresAt,
      isActive: true,
      createdAt: now,
      lastAccessedAt: now,
    });

    return { sessionId, token, expiresAt };
  },
});

/**
 * Internal: Cleanup expired sessions
 * Should be called periodically via a cron job
 */
export const cleanupExpiredSessions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Find expired sessions
    const expiredSessions = await ctx.db
      .query("sessions")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    // Deactivate expired sessions
    let cleanedCount = 0;
    for (const session of expiredSessions) {
      if (session.isActive) {
        await ctx.db.patch(session._id, {
          isActive: false,
        });
        cleanedCount++;
      }
    }

    return { cleanedCount, totalExpired: expiredSessions.length };
  },
});

/**
 * Internal: Revoke session by ID
 */
export const internalRevokeSession = internalMutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (session) {
      await ctx.db.patch(args.sessionId, {
        isActive: false,
      });
      return true;
    }
    return false;
  },
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a secure session token
 * Format: sess_<64 random chars>_<timestamp>
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
 * Parse user agent string to get device info
 */
export function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  // Simple parsing - in production, use a proper UA parser library
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  if (userAgent.includes("Mobile")) device = "Mobile";
  else if (userAgent.includes("Tablet")) device = "Tablet";

  return { browser, os, device };
}
