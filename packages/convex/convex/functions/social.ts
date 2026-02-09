import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "../_generated/dataModel";
import { insertNotification } from "./notifications";

/**
 * Social / Following System Functions
 *
 * Queries and mutations for user-to-user follow relationships.
 * Powers the "Following" feed tab and follow notifications.
 *
 * @see Phase 08 plan — plans/forum-reddit-enhancements/phase-08-user-following.md
 */

// ============================================================================
// Mutations
// ============================================================================

/**
 * Follow a user.
 *
 * Creates a follows row and updates denormalized follower/following counts
 * on both userProfiles. Sends a "follow" notification to the followee.
 *
 * @param userId - The user to follow
 */
export const followUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) throw new Error("Authentication required");

    // Can't follow yourself
    if (followerId === args.userId) {
      throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", followerId).eq("followeeId", args.userId)
      )
      .first();

    if (existing) {
      throw new Error("Already following this user");
    }

    // Create follow
    await ctx.db.insert("follows", {
      followerId,
      followeeId: args.userId,
      createdAt: Date.now(),
    });

    // Update follower's followingCount
    const followerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", followerId))
      .first();

    if (followerProfile) {
      await ctx.db.patch(followerProfile._id, {
        followingCount: (followerProfile.followingCount ?? 0) + 1,
      });
    }

    // Update followee's followerCount
    const followeeProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (followeeProfile) {
      await ctx.db.patch(followeeProfile._id, {
        followerCount: (followeeProfile.followerCount ?? 0) + 1,
      });
    }

    // Create notification
    const followerName = followerProfile?.displayName ?? "Someone";
    await insertNotification(ctx, {
      recipientId: args.userId,
      actorId: followerId,
      type: "follow",
      targetType: "user",
      targetId: followerId,
      title: "New follower",
      message: `${followerName} started following you`,
    });

    return { success: true };
  },
});

/**
 * Unfollow a user.
 *
 * Removes the follows row and decrements denormalized counts.
 *
 * @param userId - The user to unfollow
 */
export const unfollowUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const followerId = await getAuthUserId(ctx);
    if (!followerId) throw new Error("Authentication required");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", followerId).eq("followeeId", args.userId)
      )
      .first();

    if (!existing) {
      throw new Error("Not following this user");
    }

    await ctx.db.delete(existing._id);

    // Update counts
    const followerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", followerId))
      .first();

    if (followerProfile) {
      await ctx.db.patch(followerProfile._id, {
        followingCount: Math.max(0, (followerProfile.followingCount ?? 1) - 1),
      });
    }

    const followeeProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (followeeProfile) {
      await ctx.db.patch(followeeProfile._id, {
        followerCount: Math.max(0, (followeeProfile.followerCount ?? 1) - 1),
      });
    }

    return { success: true };
  },
});

// ============================================================================
// Queries
// ============================================================================

/**
 * Check if the current user follows a given user.
 *
 * @param userId - The user to check follow status for
 * @returns { isFollowing: boolean }
 */
export const getFollowStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) return { isFollowing: false };

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", currentUserId).eq("followeeId", args.userId)
      )
      .first();

    return { isFollowing: !!follow };
  },
});

/**
 * Get follower/following counts for a user.
 *
 * @param userId - The user to get counts for
 */
export const getFollowCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return {
      followerCount: profile?.followerCount ?? 0,
      followingCount: profile?.followingCount ?? 0,
    };
  },
});

/**
 * List followers of a user (paginated).
 *
 * @param userId - The user whose followers to list
 * @param limit - Max results (default 20)
 */
export const getFollowers = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_followee", (q) => q.eq("followeeId", args.userId))
      .order("desc")
      .take(limit + 1);

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;

    // Enrich with user data
    const followers = await Promise.all(
      items.map(async (follow) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", follow.followerId))
          .first();

        return {
          userId: follow.followerId,
          username: profile?.username ?? "unknown",
          displayName: profile?.displayName ?? "Anonymous",
          avatarUrl: profile?.avatarUrl ?? null,
          followedAt: follow.createdAt,
        };
      })
    );

    return {
      followers,
      hasMore,
    };
  },
});

/**
 * List users that a user follows (paginated).
 *
 * @param userId - The user whose following list to retrieve
 * @param limit - Max results (default 20)
 */
export const getFollowing = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .order("desc")
      .take(limit + 1);

    const hasMore = follows.length > limit;
    const items = hasMore ? follows.slice(0, limit) : follows;

    // Enrich with user data
    const following = await Promise.all(
      items.map(async (follow) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", follow.followeeId))
          .first();

        return {
          userId: follow.followeeId,
          username: profile?.username ?? "unknown",
          displayName: profile?.displayName ?? "Anonymous",
          avatarUrl: profile?.avatarUrl ?? null,
          followedAt: follow.createdAt,
        };
      })
    );

    return {
      following,
      hasMore,
    };
  },
});

/**
 * Get a feed of threads from followed users.
 *
 * Fetches followed user IDs, then retrieves their recent threads
 * with full enrichment (author + category info).
 *
 * @param limit - Max threads (default 20)
 * @param cursor - Cursor for pagination
 * @returns Enriched discussions with hasMore flag + nextCursor
 */
export const getFollowingFeed = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return { discussions: [], hasMore: false, nextCursor: null };

    const limit = args.limit ?? 20;

    // Get users the current user follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    const followedUserIds = new Set(follows.map((f) => f.followeeId));

    if (followedUserIds.size === 0) {
      return { discussions: [], hasMore: false, nextCursor: null };
    }

    // Fetch threads — optionally from cursor
    let threads: Doc<"forumThreads">[];
    const fetchLimit = limit * 5; // Over-fetch to filter by followed users

    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as never);
      if (cursorDoc) {
        const cursorCreatedAt = (cursorDoc as { createdAt: number }).createdAt;
        threads = await ctx.db
          .query("forumThreads")
          .filter((q) =>
            q.and(
              q.eq(q.field("isDeleted"), false),
              q.lt(q.field("createdAt"), cursorCreatedAt)
            )
          )
          .order("desc")
          .take(fetchLimit);
      } else {
        threads = [];
      }
    } else {
      threads = await ctx.db
        .query("forumThreads")
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .take(fetchLimit);
    }

    // Filter to only threads from followed users
    const filteredThreads = threads.filter((t) =>
      followedUserIds.has(t.authorId)
    );

    const hasMore = filteredThreads.length > limit;
    const result = filteredThreads.slice(0, limit);

    // Enrich with author + category
    const enriched = await Promise.all(
      result.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const authorProfile = author
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) =>
                q.eq("userId", author._id)
              )
              .first()
          : null;
        const category = await ctx.db.get(thread.categoryId);

        return {
          _id: thread._id,
          title: thread.title,
          slug: thread.slug,
          body: thread.body ?? null,
          aiSummary: thread.aiSummary ?? null,
          imageUrl: thread.imageUrl ?? null,
          postType: thread.postType ?? "text",
          linkUrl: thread.linkUrl ?? null,
          linkDomain: thread.linkDomain ?? null,
          linkTitle: thread.linkTitle ?? null,
          linkDescription: thread.linkDescription ?? null,
          linkImage: thread.linkImage ?? null,
          images: thread.images ?? null,
          pollOptions: thread.pollOptions ?? null,
          pollEndsAt: thread.pollEndsAt ?? null,
          isPinned: thread.isPinned,
          upvoteCount: thread.upvoteCount ?? 0,
          downvoteCount: thread.downvoteCount ?? 0,
          score: thread.score ?? (thread.upvoteCount ?? 0),
          commentCount: thread.commentCount ?? thread.postCount ?? 0,
          postCount: thread.postCount,
          viewCount: thread.viewCount,
          createdAt: thread.createdAt,
          author: author
            ? {
                id: author._id,
                name:
                  authorProfile?.displayName ?? author.name ?? "Anonymous",
                username: authorProfile?.username ?? author._id,
                avatarUrl: authorProfile?.avatarUrl ?? null,
              }
            : null,
          category: category
            ? {
                id: category._id,
                name: category.name,
                slug: category.slug,
                icon: category.icon ?? null,
                color: category.color ?? null,
              }
            : null,
        };
      })
    );

    return {
      discussions: enriched,
      hasMore,
      nextCursor:
        enriched.length > 0
          ? (enriched[enriched.length - 1]?._id ?? null)
          : null,
    };
  },
});
