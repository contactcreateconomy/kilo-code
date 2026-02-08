import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// ============================================================================
// Post Flair Queries
// ============================================================================

/**
 * Get all active flairs for a category.
 * Used in the flair selector when creating/editing a thread.
 */
export const getCategoryFlairs = query({
  args: { categoryId: v.id("forumCategories") },
  handler: async (ctx, args) => {
    const flairs = await ctx.db
      .query("postFlairs")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return flairs;
  },
});

/**
 * Get a single flair by ID (used for display on thread cards).
 */
export const getFlair = query({
  args: { flairId: v.id("postFlairs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.flairId);
  },
});

// ============================================================================
// Post Flair Mutations
// ============================================================================

/**
 * Set or remove a flair on a thread.
 * Authors can set any non-mod-only flair; mods can set any flair.
 */
export const setThreadFlair = mutation({
  args: {
    threadId: v.id("forumThreads"),
    flairId: v.optional(v.id("postFlairs")), // undefined to remove
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isModOrAdmin =
      profile?.defaultRole === "admin" ||
      profile?.defaultRole === "moderator";

    // If flair is mod-only, require mod
    if (args.flairId) {
      const flair = await ctx.db.get(args.flairId);
      if (!flair) throw new Error("Flair not found");

      if (flair.isModOnly && !isModOrAdmin) {
        throw new Error("This flair can only be applied by moderators");
      }

      // Verify flair belongs to thread's category
      if (flair.categoryId !== thread.categoryId) {
        throw new Error("Flair not available for this category");
      }
    }

    // Author or mod can set flair
    if (thread.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.threadId, {
      flairId: args.flairId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Create a post flair for a category (admin/mod only).
 */
export const createPostFlair = mutation({
  args: {
    categoryId: v.id("forumCategories"),
    name: v.string(),
    displayName: v.string(),
    backgroundColor: v.string(),
    textColor: v.string(),
    emoji: v.optional(v.string()),
    isModOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (
      profile?.defaultRole !== "admin" &&
      profile?.defaultRole !== "moderator"
    ) {
      throw new Error("Admin or moderator role required");
    }

    const now = Date.now();

    // Get current max sort order
    const existing = await ctx.db
      .query("postFlairs")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const maxOrder = existing.reduce(
      (max, f) => Math.max(max, f.sortOrder),
      0
    );

    const flairId = await ctx.db.insert("postFlairs", {
      categoryId: args.categoryId,
      name: args.name,
      displayName: args.displayName,
      backgroundColor: args.backgroundColor,
      textColor: args.textColor,
      emoji: args.emoji,
      isModOnly: args.isModOnly,
      sortOrder: maxOrder + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return flairId;
  },
});

/**
 * Update an existing post flair (admin/mod only).
 */
export const updatePostFlair = mutation({
  args: {
    flairId: v.id("postFlairs"),
    displayName: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    emoji: v.optional(v.string()),
    isModOnly: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (
      profile?.defaultRole !== "admin" &&
      profile?.defaultRole !== "moderator"
    ) {
      throw new Error("Admin or moderator role required");
    }

    const flair = await ctx.db.get(args.flairId);
    if (!flair) throw new Error("Flair not found");

    const { flairId: _id, ...updates } = args;
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(args.flairId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// User Flair Queries
// ============================================================================

/**
 * Get a user's flair for a specific category (falls back to global flair).
 */
export const getUserFlair = query({
  args: {
    userId: v.id("users"),
    categoryId: v.optional(v.id("forumCategories")),
  },
  handler: async (ctx, args) => {
    // First check category-specific flair
    if (args.categoryId) {
      const categoryFlair = await ctx.db
        .query("userFlairs")
        .withIndex("by_user_category", (q) =>
          q.eq("userId", args.userId).eq("categoryId", args.categoryId)
        )
        .first();

      if (categoryFlair) return categoryFlair;
    }

    // Fall back to global flair (categoryId undefined)
    const allFlairs = await ctx.db
      .query("userFlairs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const globalFlair = allFlairs.find((f) => !f.categoryId);
    return globalFlair ?? null;
  },
});

/**
 * Get the current authenticated user's flair.
 */
export const getMyFlair = query({
  args: {
    categoryId: v.optional(v.id("forumCategories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    if (args.categoryId) {
      const categoryFlair = await ctx.db
        .query("userFlairs")
        .withIndex("by_user_category", (q) =>
          q.eq("userId", userId).eq("categoryId", args.categoryId)
        )
        .first();

      if (categoryFlair) return categoryFlair;
    }

    const allFlairs = await ctx.db
      .query("userFlairs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const globalFlair = allFlairs.find((f) => !f.categoryId);
    return globalFlair ?? null;
  },
});

// ============================================================================
// User Flair Mutations
// ============================================================================

/**
 * Set or update the current user's flair.
 */
export const setUserFlair = mutation({
  args: {
    categoryId: v.optional(v.id("forumCategories")),
    text: v.string(),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Validate text length
    if (args.text.length > 30) {
      throw new Error("Flair text must be 30 characters or less");
    }

    if (args.text.trim().length === 0) {
      throw new Error("Flair text cannot be empty");
    }

    const now = Date.now();

    // Check for existing flair in this category
    if (args.categoryId) {
      const existing = await ctx.db
        .query("userFlairs")
        .withIndex("by_user_category", (q) =>
          q.eq("userId", userId).eq("categoryId", args.categoryId)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          text: args.text,
          emoji: args.emoji,
          isCustom: true,
          updatedAt: now,
        });
        return { success: true };
      }
    } else {
      // Global flair — find existing
      const allFlairs = await ctx.db
        .query("userFlairs")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const globalFlair = allFlairs.find((f) => !f.categoryId);

      if (globalFlair) {
        await ctx.db.patch(globalFlair._id, {
          text: args.text,
          emoji: args.emoji,
          isCustom: true,
          updatedAt: now,
        });
        return { success: true };
      }
    }

    // Create new flair
    await ctx.db.insert("userFlairs", {
      userId,
      categoryId: args.categoryId,
      text: args.text,
      emoji: args.emoji,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Remove the current user's flair.
 */
export const removeUserFlair = mutation({
  args: {
    categoryId: v.optional(v.id("forumCategories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    if (args.categoryId) {
      const existing = await ctx.db
        .query("userFlairs")
        .withIndex("by_user_category", (q) =>
          q.eq("userId", userId).eq("categoryId", args.categoryId)
        )
        .first();

      if (existing) {
        await ctx.db.delete(existing._id);
      }
    } else {
      const allFlairs = await ctx.db
        .query("userFlairs")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const globalFlair = allFlairs.find((f) => !f.categoryId);
      if (globalFlair) {
        await ctx.db.delete(globalFlair._id);
      }
    }

    return { success: true };
  },
});
