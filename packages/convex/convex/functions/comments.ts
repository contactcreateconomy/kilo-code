import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id, Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { insertNotification, parseMentions } from "./notifications";
import { checkBanStatus, checkMuteStatus } from "./moderation";

/**
 * Reddit-style Comment System
 *
 * Thread → Comments (infinitely nested via parentId).
 * Replaces the old Thread → Posts → Comments 3-level hierarchy.
 */

// ============================================================================
// Comment Queries
// ============================================================================

/**
 * Get thread with body + top-level comments (paginated).
 *
 * Returns the thread itself (using the new `body` field or falling back
 * to the first forumPost) and the first page of top-level comments
 * enriched with author info and reply counts.
 */
export const getThreadWithComments = query({
  args: {
    threadId: v.id("forumThreads"),
    sortBy: v.optional(
      v.union(
        v.literal("best"),
        v.literal("top"),
        v.literal("new"),
        v.literal("controversial")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) return null;

    const limit = args.limit ?? 20;
    const sortBy = args.sortBy ?? "best";

    // Get thread author
    const author = await ctx.db.get(thread.authorId);
    const authorProfile = author
      ? await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", author._id))
          .first()
      : null;

    // Get category
    const category = await ctx.db.get(thread.categoryId);

    // Get thread body — prefer new `body` field, fall back to first forumPost
    let body = thread.body ?? null;
    if (!body) {
      const firstPost = await ctx.db
        .query("forumPosts")
        .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
        .filter((q) =>
          q.and(
            q.eq(q.field("isFirstPost"), true),
            q.eq(q.field("isDeleted"), false)
          )
        )
        .first();
      body = firstPost?.content ?? "";
    }

    // Get top-level comments (depth = 0)
    let comments: Doc<"comments">[];
    if (sortBy === "new") {
      comments = await ctx.db
        .query("comments")
        .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
        .filter((q) =>
          q.and(
            q.eq(q.field("depth"), 0),
            q.eq(q.field("isDeleted"), false)
          )
        )
        .order("desc")
        .take(limit + 1);
    } else {
      // For best/top/controversial: fetch more and sort in memory
      // Cap batch size to avoid excessive memory usage on large threads
      const MAX_SORT_BATCH = 200;
      const fetchCount = Math.min(limit * 3, MAX_SORT_BATCH);
      comments = await ctx.db
        .query("comments")
        .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
        .filter((q) =>
          q.and(
            q.eq(q.field("depth"), 0),
            q.eq(q.field("isDeleted"), false)
          )
        )
        .order("desc")
        .take(fetchCount);

      comments = sortComments(comments, sortBy);
    }

    const hasMore = comments.length > limit;
    const topComments = comments.slice(0, limit);

    // Enrich comments with author info + first 3 replies
    const enrichedComments = await Promise.all(
      topComments.map(async (comment) => {
        return enrichComment(ctx, comment, 3);
      })
    );

    // Phase 10: Fetch thread tags
    const threadTagJunctions = await ctx.db
      .query("forumThreadTags")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
    const tags = (
      await Promise.all(threadTagJunctions.map((tt) => ctx.db.get(tt.tagId)))
    )
      .filter(Boolean)
      .map((tag) => ({
        _id: tag!._id,
        name: tag!.name,
        displayName: tag!.displayName,
        color: tag!.color ?? null,
      }));

    // Phase 10: Fetch flair if set
    let flair = null;
    if (thread.flairId) {
      const flairDoc = await ctx.db.get(thread.flairId);
      if (flairDoc && flairDoc.isActive) {
        flair = {
          _id: flairDoc._id,
          displayName: flairDoc.displayName,
          backgroundColor: flairDoc.backgroundColor,
          textColor: flairDoc.textColor,
          emoji: flairDoc.emoji ?? null,
        };
      }
    }

    return {
      thread: {
        _id: thread._id,
        title: thread.title,
        slug: thread.slug,
        body,
        aiSummary: thread.aiSummary ?? null,
        imageUrl: thread.imageUrl ?? null,
        postType: thread.postType ?? "text",
        // Link post fields
        linkUrl: thread.linkUrl ?? null,
        linkDomain: thread.linkDomain ?? null,
        linkTitle: thread.linkTitle ?? null,
        linkDescription: thread.linkDescription ?? null,
        linkImage: thread.linkImage ?? null,
        // Image post fields
        images: thread.images ?? null,
        // Poll fields
        pollOptions: thread.pollOptions ?? null,
        pollEndsAt: thread.pollEndsAt ?? null,
        pollMultiSelect: thread.pollMultiSelect ?? false,
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        viewCount: thread.viewCount,
        commentCount: thread.commentCount ?? thread.postCount ?? 0,
        upvoteCount: thread.upvoteCount ?? 0,
        downvoteCount: thread.downvoteCount ?? 0,
        score: thread.score ?? (thread.upvoteCount ?? 0),
        createdAt: thread.createdAt,
        author: author
          ? {
              id: author._id,
              name:
                authorProfile?.displayName ?? author.name ?? "Anonymous",
              username: authorProfile?.username ?? author._id,
              avatarUrl: authorProfile?.avatarUrl ?? null,
              role: authorProfile?.defaultRole ?? "customer",
            }
          : null,
        category: category
          ? {
              id: category._id,
              name: category.name,
              slug: category.slug,
            }
          : null,
        // Phase 10: Tags & Flair
        tags,
        flair,
      },
      comments: enrichedComments,
      hasMore,
    };
  },
});

/**
 * Get replies to a specific comment (for "load more replies").
 *
 * Returns paginated child comments with author info + their nested replies.
 */
export const getCommentReplies = query({
  args: {
    parentId: v.id("comments"),
    sortBy: v.optional(
      v.union(
        v.literal("best"),
        v.literal("top"),
        v.literal("new"),
        v.literal("controversial")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const sortBy = args.sortBy ?? "best";

    let replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit * 2);

    replies = sortComments(replies, sortBy);

    const hasMore = replies.length > limit;
    const result = replies.slice(0, limit);

    const enriched = await Promise.all(
      result.map(async (reply) => {
        return enrichComment(ctx, reply, 2);
      })
    );

    return { replies: enriched, hasMore };
  },
});

// ============================================================================
// Comment Mutations
// ============================================================================

/**
 * Create a comment on a thread (top-level or reply).
 */
export const createThreadComment = mutation({
  args: {
    threadId: v.id("forumThreads"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Check ban/mute status before allowing content creation
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) throw new Error("Thread not found");
    if (thread.isLocked) throw new Error("Thread is locked");

    // Validate content
    if (args.content.trim().length < 1)
      throw new Error("Comment cannot be empty");
    if (args.content.length > 10000)
      throw new Error("Comment must be less than 10,000 characters");

    // Determine depth
    let depth = 0;
    let parentComment: Doc<"comments"> | null = null;
    if (args.parentId) {
      parentComment = await ctx.db.get(args.parentId);
      if (!parentComment || parentComment.isDeleted)
        throw new Error("Parent comment not found");
      if (parentComment.threadId !== args.threadId)
        throw new Error("Parent comment must be on the same thread");
      depth = parentComment.depth + 1;
    }

    const now = Date.now();

    const commentId = await ctx.db.insert("comments", {
      tenantId: thread.tenantId,
      threadId: args.threadId,
      authorId: userId,
      parentId: args.parentId,
      content: args.content,
      depth,
      upvoteCount: 0,
      downvoteCount: 0,
      score: 0,
      replyCount: 0,
      isCollapsed: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update parent's replyCount
    if (parentComment && args.parentId) {
      await ctx.db.patch(args.parentId, {
        replyCount: parentComment.replyCount + 1,
        updatedAt: now,
      });
    }

    // Update thread commentCount
    await ctx.db.patch(args.threadId, {
      commentCount: (thread.commentCount ?? thread.postCount ?? 0) + 1,
      lastPostAt: now,
      lastPostUserId: userId,
      updatedAt: now,
    });

    // --- Notifications ---
    const actorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const actorName = actorProfile?.displayName ?? "Someone";

    if (parentComment) {
      // Reply to a comment — notify parent comment author
      if (parentComment.authorId !== userId) {
        await insertNotification(ctx, {
          tenantId: thread.tenantId ?? undefined,
          recipientId: parentComment.authorId,
          actorId: userId,
          type: "reply",
          targetType: "comment",
          targetId: commentId,
          title: `${actorName} replied to your comment`,
          message: args.content.slice(0, 120),
        });
      }
    } else {
      // Top-level comment — notify thread author
      if (thread.authorId !== userId) {
        await insertNotification(ctx, {
          tenantId: thread.tenantId ?? undefined,
          recipientId: thread.authorId,
          actorId: userId,
          type: "reply",
          targetType: "thread",
          targetId: args.threadId,
          title: `${actorName} commented on your thread`,
          message: args.content.slice(0, 120),
        });
      }
    }

    // @mention notifications
    const mentions = parseMentions(args.content);
    for (const username of mentions) {
      const mentionedProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
      if (mentionedProfile && mentionedProfile.userId !== userId) {
        await insertNotification(ctx, {
          tenantId: thread.tenantId ?? undefined,
          recipientId: mentionedProfile.userId,
          actorId: userId,
          type: "mention",
          targetType: "comment",
          targetId: commentId,
          title: `${actorName} mentioned you`,
          message: args.content.slice(0, 120),
        });
      }
    }

    return commentId;
  },
});

/**
 * Update a comment's content.
 */
export const updateThreadComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted) throw new Error("Comment not found");

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (comment.authorId !== userId && !isModOrAdmin)
      throw new Error("Not authorized to edit this comment");

    if (args.content.trim().length < 1)
      throw new Error("Comment cannot be empty");
    if (args.content.length > 10000)
      throw new Error("Comment must be less than 10,000 characters");

    const now = Date.now();
    await ctx.db.patch(args.commentId, {
      content: args.content,
      editedAt: now,
      updatedAt: now,
    });

    return true;
  },
});

/**
 * Soft-delete a comment.
 *
 * If the comment has replies, it stays visible as "[deleted]".
 * If no replies, it can be fully hidden.
 */
export const deleteThreadComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted) throw new Error("Comment not found");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (comment.authorId !== userId && !isModOrAdmin)
      throw new Error("Not authorized to delete this comment");

    const now = Date.now();
    await ctx.db.patch(args.commentId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    // Update parent's replyCount
    if (comment.parentId) {
      const parent = await ctx.db.get(comment.parentId);
      if (parent) {
        await ctx.db.patch(comment.parentId, {
          replyCount: Math.max(0, parent.replyCount - 1),
          updatedAt: now,
        });
      }
    }

    // Update thread commentCount
    const thread = await ctx.db.get(comment.threadId);
    if (thread) {
      await ctx.db.patch(comment.threadId, {
        commentCount: Math.max(
          0,
          (thread.commentCount ?? thread.postCount ?? 0) - 1
        ),
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Toggle collapse on a comment (moderator action).
 */
export const collapseComment = mutation({
  args: {
    commentId: v.id("comments"),
    collapsed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (!isModOrAdmin) throw new Error("Moderator role required");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    await ctx.db.patch(args.commentId, {
      isCollapsed: args.collapsed,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Sort comments by the given algorithm.
 */
function sortComments(
  comments: Doc<"comments">[],
  sortBy: "best" | "top" | "new" | "controversial"
): Doc<"comments">[] {
  const sorted = [...comments];

  switch (sortBy) {
    case "best":
      // Wilson score lower bound — accounts for sample size
      sorted.sort((a, b) => wilsonScore(b) - wilsonScore(a));
      break;
    case "top":
      sorted.sort((a, b) => b.score - a.score);
      break;
    case "new":
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case "controversial": {
      sorted.sort((a, b) => {
        const contA = commentControversy(a);
        const contB = commentControversy(b);
        return contB - contA;
      });
      break;
    }
  }

  return sorted;
}

/**
 * Z-score for 95% confidence interval.
 * Used in Wilson score calculation to rank comments by confidence-adjusted quality.
 * @see https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
 */
const WILSON_Z_SCORE_95 = 1.96;

/**
 * Wilson score confidence interval for a Bernoulli parameter.
 * Returns the lower bound of the 95% confidence interval.
 *
 * This is the same algorithm Reddit uses for "best" sort —
 * it ranks items by the lower bound of a confidence interval for the
 * "true" upvote ratio, which penalizes items with few votes.
 */
function wilsonScore(comment: Doc<"comments">): number {
  const up = comment.upvoteCount;
  const n = up + comment.downvoteCount;
  if (n === 0) return 0;

  const z = WILSON_Z_SCORE_95;
  const phat = up / n;
  const denom = 1 + (z * z) / n;
  const center = phat + (z * z) / (2 * n);
  const spread = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n);

  return (center - spread) / denom;
}

/**
 * Controversy score for a comment (same formula as threads).
 */
function commentControversy(comment: Doc<"comments">): number {
  const total = comment.upvoteCount + comment.downvoteCount;
  if (total < 3) return 0;
  const balance =
    1 -
    Math.abs(comment.upvoteCount - comment.downvoteCount) / total;
  return total * balance;
}

/**
 * Enrich a comment with author info and first N replies (recursive).
 */
async function enrichComment(
  ctx: QueryCtx,
  comment: Doc<"comments">,
  replyPreviewCount: number
) {
  const author = await ctx.db.get(comment.authorId);
  const authorProfile = author
    ? await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", author._id))
        .first()
    : null;

  // Get first N replies
  let replies: Doc<"comments">[] = [];
  let moreRepliesCount = 0;
  if (comment.replyCount > 0 && replyPreviewCount > 0) {
    const allReplies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", comment._id))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(replyPreviewCount + 1);

    moreRepliesCount = Math.max(
      0,
      comment.replyCount - replyPreviewCount
    );
    replies = allReplies.slice(0, replyPreviewCount);
  }

  // Recursively enrich replies (decrease preview count to limit depth)
  const enrichedReplies = await Promise.all(
    replies.map((reply) =>
      enrichComment(ctx, reply, Math.max(0, replyPreviewCount - 1))
    )
  );

  return {
    _id: comment._id,
    threadId: comment.threadId,
    parentId: comment.parentId ?? null,
    content: comment.isDeleted ? "[deleted]" : comment.content,
    depth: comment.depth,
    upvoteCount: comment.upvoteCount,
    downvoteCount: comment.downvoteCount,
    score: comment.score,
    replyCount: comment.replyCount,
    isCollapsed: comment.isCollapsed,
    isDeleted: comment.isDeleted,
    editedAt: comment.editedAt ?? null,
    createdAt: comment.createdAt,
    author: comment.isDeleted
      ? null
      : author
        ? {
            id: author._id,
            name:
              authorProfile?.displayName ?? author.name ?? "Anonymous",
            username: authorProfile?.username ?? author._id,
            avatarUrl: authorProfile?.avatarUrl ?? null,
          }
        : null,
    replies: enrichedReplies,
    moreRepliesCount,
    isTruncated: comment.depth >= 10, // Depth limit for "continue thread" link
  };
}
