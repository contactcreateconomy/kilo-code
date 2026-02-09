import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "../_generated/dataModel";

// ============================================================================
// Tag Queries
// ============================================================================

/**
 * Search tags by name prefix.
 * Used for tag autocomplete in the discussion form.
 */
export const searchTags = query({
  args: { queryStr: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const search = args.queryStr.toLowerCase().trim();

    if (search.length < 1) return [];

    // Get tags and filter client-side (Convex doesn't support LIKE queries)
    const tags = await ctx.db
      .query("forumTags")
      .order("desc")
      .take(200);

    const filtered = tags
      .filter((t) => t.name.includes(search))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);

    return filtered;
  },
});

/**
 * Get popular tags ordered by usage count.
 * Used for the sidebar "Popular Tags" widget.
 */
export const getPopularTags = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const tags = await ctx.db
      .query("forumTags")
      .withIndex("by_usage")
      .order("desc")
      .take(limit);

    return tags;
  },
});

/**
 * Get all tags for a specific thread.
 */
export const getThreadTags = query({
  args: { threadId: v.id("forumThreads") },
  handler: async (ctx, args) => {
    const threadTags = await ctx.db
      .query("forumThreadTags")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    const tags = await Promise.all(
      threadTags.map((tt) => ctx.db.get(tt.tagId))
    );

    return tags.filter(Boolean);
  },
});

/**
 * Get threads for a specific tag (by slug).
 * Used for tag-based filtering.
 */
export const getThreadsByTag = query({
  args: {
    tagSlug: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    // Find the tag by slug
    const tag = await ctx.db
      .query("forumTags")
      .withIndex("by_slug", (q) => q.eq("slug", args.tagSlug))
      .first();

    if (!tag) return { threads: [], nextCursor: null };

    // Get thread-tag junctions
    const threadTags = await ctx.db
      .query("forumThreadTags")
      .withIndex("by_tag", (q) => q.eq("tagId", tag._id))
      .collect();

    // Fetch threads
    const threads = (
      await Promise.all(threadTags.map((tt) => ctx.db.get(tt.threadId)))
    )
      .filter((t): t is Doc<"forumThreads"> => t !== null && !t.isDeleted)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return { threads, tag, nextCursor: null };
  },
});

// ============================================================================
// Tag Mutations
// ============================================================================

/**
 * Add tags to a thread. Creates new tags if they don't exist yet.
 * Only the thread author can add tags (max 5).
 */
export const addTagsToThread = mutation({
  args: {
    threadId: v.id("forumThreads"),
    tagNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");

    // Only author or mods can add tags
    if (thread.authorId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      const isModOrAdmin =
        profile?.defaultRole === "admin" ||
        profile?.defaultRole === "moderator";

      if (!isModOrAdmin) {
        throw new Error("Only the author or moderators can add tags");
      }
    }

    // Limit to 5 tags
    if (args.tagNames.length > 5) {
      throw new Error("Maximum 5 tags allowed");
    }

    const now = Date.now();

    for (const tagName of args.tagNames) {
      const normalizedName = tagName.toLowerCase().trim();
      if (!normalizedName) continue;

      // Find or create tag
      let tag = await ctx.db
        .query("forumTags")
        .withIndex("by_name", (q) => q.eq("name", normalizedName))
        .first();

      if (!tag) {
        const tagId = await ctx.db.insert("forumTags", {
          name: normalizedName,
          displayName: tagName.trim(),
          slug: normalizedName.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        });
        tag = await ctx.db.get(tagId);
      }

      if (!tag) continue;

      // Check if already tagged
      const existing = await ctx.db
        .query("forumThreadTags")
        .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
        .filter((q) => q.eq(q.field("tagId"), tag!._id))
        .first();

      if (!existing) {
        await ctx.db.insert("forumThreadTags", {
          threadId: args.threadId,
          tagId: tag._id,
          createdAt: now,
        });

        // Update usage count
        await ctx.db.patch(tag._id, {
          usageCount: tag.usageCount + 1,
          updatedAt: now,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Remove a specific tag from a thread.
 * Only the thread author or moderators can remove tags.
 */
export const removeTagFromThread = mutation({
  args: {
    threadId: v.id("forumThreads"),
    tagId: v.id("forumTags"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");

    // Only author or mods
    if (thread.authorId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      const isModOrAdmin =
        profile?.defaultRole === "admin" ||
        profile?.defaultRole === "moderator";

      if (!isModOrAdmin) {
        throw new Error("Not authorized");
      }
    }

    const threadTag = await ctx.db
      .query("forumThreadTags")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("tagId"), args.tagId))
      .first();

    if (threadTag) {
      await ctx.db.delete(threadTag._id);

      // Decrement usage count
      const tag = await ctx.db.get(args.tagId);
      if (tag) {
        await ctx.db.patch(args.tagId, {
          usageCount: Math.max(0, tag.usageCount - 1),
          updatedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});
