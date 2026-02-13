import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "../_generated/dataModel";
import {
  insertNotification,
  parseMentions,
  isUpvoteMilestone,
} from "./notifications";
import { checkBanStatus, checkMuteStatus } from "./moderation";
import { authenticatedMutation } from "../lib/middleware";
import { createError, ErrorCode } from "../lib/errors";

// Domain modules
import { enrichAuthor } from "../lib/shared/author";
import {
  getCategoryById,
  getCategoryBySlug as repoCategoryBySlug,
  listActiveCategories,
  getThreadById,
  getThreadsByCategory,
  getThreadsByAuthor,
  getRecentThreads,
  getThreadsBeforeCursor,
  getPostById,
  getPostsByThread,
  getPostsByAuthor,
  getCommentById,
  getCommentsByPost,
  getReactionByUserTarget,
  getUserBookmarks,
  getThreadTags,
  getFlairById,
  getLeaderboardEntries,
  getUserPoints,
  getActiveCampaign as repoActiveCampaign,
  getProfileByUsername,
  insertThread,
  patchThread,
  insertPost,
  patchPost,
  insertComment,
  patchComment,
  insertReaction,
  deleteReaction,
  patchCategory,
} from "../lib/forum/forum.repository";
import {
  canEditThread,
  canDeleteThread,
  canEditPost,
  canDeletePost,
  canDeleteComment,
} from "../lib/forum/forum.policies";
import {
  generateThreadSlug,
  validateThreadTitle,
  validatePostContent,
  validateCommentContent,
  validatePostTypeFields,
  extractLinkDomain,
  sortThreads,
  scoreForTrending,
  formatCount,
} from "../lib/forum/forum.service";
import {
  toThreadListItem,
  toCommentTree,
  toCategoryTree,
  toLeaderboardEntry,
  toTagInfo,
  toFlairInfo,
} from "../lib/forum/forum.mappers";

/**
 * Forum Management Functions
 *
 * Queries and mutations for managing forum categories, threads, posts,
 * and comments. Each handler delegates to lib/forum/ domain modules.
 */

// ============================================================================
// Category Queries
// ============================================================================

export const listForumCategories = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const categories = await listActiveCategories(ctx, args.tenantId);
    return toCategoryTree(categories);
  },
});

export const getForumCategory = query({
  args: {
    categoryId: v.id("forumCategories"),
  },
  handler: async (ctx, args) => {
    const category = await getCategoryById(ctx, args.categoryId);
    if (!category || !category.isActive) return null;

    const threads = await getThreadsByCategory(ctx, args.categoryId, {
      limit: 10,
    });

    return { ...category, recentThreads: threads };
  },
});

// ============================================================================
// Thread Queries
// ============================================================================

export const listThreads = query({
  args: {
    categoryId: v.id("forumCategories"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const pinnedThreads = await getThreadsByCategory(ctx, args.categoryId, {
      limit: 100,
      pinned: true,
    });
    const regularThreads = await getThreadsByCategory(ctx, args.categoryId, {
      limit: limit + 1,
      pinned: false,
    });

    const hasMore = regularThreads.length > limit;
    const threads = hasMore ? regularThreads.slice(0, limit) : regularThreads;

    const allThreads = [...pinnedThreads, ...threads];
    const threadsWithAuthors = await Promise.all(
      allThreads.map(async (thread) => {
        const author = await enrichAuthor(ctx, thread.authorId);
        const lastPostUser = thread.lastPostUserId
          ? await ctx.db.get(thread.lastPostUserId)
          : null;
        return {
          ...thread,
          author,
          lastPostUser: lastPostUser
            ? { id: lastPostUser._id, name: lastPostUser.name }
            : null,
        };
      })
    );

    return {
      pinned: threadsWithAuthors.filter((t) => t.isPinned),
      threads: threadsWithAuthors.filter((t) => !t.isPinned),
      hasMore,
      nextCursor: hasMore ? threads[threads.length - 1]?._id ?? null : null,
    };
  },
});

export const getThread = query({
  args: {
    threadId: v.id("forumThreads"),
    postLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const thread = await getThreadById(ctx, args.threadId);
    if (!thread || thread.isDeleted) return null;

    const postLimit = args.postLimit ?? 20;
    const author = await enrichAuthor(ctx, thread.authorId);
    const category = await getCategoryById(ctx, thread.categoryId);
    const posts = await getPostsByThread(ctx, args.threadId, postLimit);

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = await enrichAuthor(ctx, post.authorId);
        const comments = await getCommentsByPost(ctx, post._id);
        return { ...post, author: postAuthor, commentCount: comments.length };
      })
    );

    return {
      ...thread,
      author,
      category: category
        ? { id: category._id, name: category.name, slug: category.slug }
        : null,
      posts: postsWithAuthors,
    };
  },
});

export const searchThreads = query({
  args: {
    query: v.string(),
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.optional(v.id("forumCategories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const searchQuery = ctx.db
      .query("forumThreads")
      .withSearchIndex("search_threads", (q) => {
        let search = q.search("title", args.query);
        if (args.tenantId) {
          search = search.eq("tenantId", args.tenantId);
        }
        if (args.categoryId) {
          search = search.eq("categoryId", args.categoryId);
        }
        search = search.eq("isDeleted", false);
        return search;
      });

    return await searchQuery.take(limit);
  },
});

// ============================================================================
// Post and Comment Queries
// ============================================================================

export const getPostComments = query({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const comments = await getCommentsByPost(ctx, args.postId);

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await enrichAuthor(ctx, comment.authorId);
        return { ...comment, author };
      })
    );

    return toCommentTree(commentsWithAuthors);
  },
});

// ============================================================================
// Thread Mutations
// ============================================================================

export const createThread = authenticatedMutation({
  args: {
    categoryId: v.id("forumCategories"),
    title: v.string(),
    content: v.string(),
    tenantId: v.optional(v.id("tenants")),
    postType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("link"),
        v.literal("image"),
        v.literal("poll")
      )
    ),
    linkUrl: v.optional(v.string()),
    linkDomain: v.optional(v.string()),
    linkTitle: v.optional(v.string()),
    linkDescription: v.optional(v.string()),
    linkImage: v.optional(v.string()),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          caption: v.optional(v.string()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
        })
      )
    ),
    pollOptions: v.optional(v.array(v.string())),
    pollEndsAt: v.optional(v.number()),
    pollMultiSelect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const postType = args.postType ?? "text";
    const category = await getCategoryById(ctx, args.categoryId);
    if (!category || !category.isActive) {
      throw new Error("Category not found");
    }

    validateThreadTitle(args.title);
    validatePostTypeFields(postType, args);

    const now = Date.now();
    const slug = generateThreadSlug(args.title, now);

    let linkDomain = args.linkDomain;
    if (postType === "link" && args.linkUrl && !linkDomain) {
      linkDomain = extractLinkDomain(args.linkUrl) ?? undefined;
    }

    const threadId = await insertThread(ctx, {
      tenantId: args.tenantId ?? category.tenantId,
      categoryId: args.categoryId,
      authorId: userId,
      title: args.title,
      slug,
      body: postType === "text" ? args.content : (args.content || undefined),
      postType,
      ...(postType === "link"
        ? {
            linkUrl: args.linkUrl,
            linkDomain,
            linkTitle: args.linkTitle,
            linkDescription: args.linkDescription,
            linkImage: args.linkImage,
          }
        : {}),
      ...(postType === "image" ? { images: args.images } : {}),
      ...(postType === "poll"
        ? {
            pollOptions: args.pollOptions,
            pollEndsAt: args.pollEndsAt,
            pollMultiSelect: args.pollMultiSelect ?? false,
          }
        : {}),
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      postCount: 1,
      commentCount: 0,
      upvoteCount: 0,
      downvoteCount: 0,
      score: 0,
      bookmarkCount: 0,
      lastPostAt: now,
      lastPostUserId: userId,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    await insertPost(ctx, {
      tenantId: args.tenantId ?? category.tenantId,
      threadId,
      authorId: userId,
      content: args.content || args.title,
      status: "published",
      isFirstPost: true,
      likeCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    await patchCategory(ctx, args.categoryId, {
      threadCount: category.threadCount + 1,
      postCount: category.postCount + 1,
      lastPostAt: now,
      updatedAt: now,
    });

    return threadId;
  },
});

export const updateThread = authenticatedMutation({
  args: {
    threadId: v.id("forumThreads"),
    title: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    isLocked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const thread = await getThreadById(ctx, args.threadId);
    if (!thread || thread.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Thread not found");
    }

    await canEditThread(ctx, thread.authorId, userId, {
      editingTitle: args.title !== undefined,
      editingModFields:
        args.isPinned !== undefined || args.isLocked !== undefined,
    });

    if (args.title !== undefined) {
      validateThreadTitle(args.title);
    }

    const { threadId: _threadId, ...updates } = args;
    await patchThread(ctx, args.threadId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Notification: thread pinned or locked by mod
    if (
      (args.isPinned !== undefined || args.isLocked !== undefined) &&
      thread.authorId !== userId
    ) {
      const modAuthor = await enrichAuthor(ctx, userId);
      const modName = modAuthor?.displayName ?? "A moderator";

      if (args.isPinned !== undefined) {
        const action = args.isPinned ? "pinned" : "unpinned";
        await insertNotification(ctx, {
          tenantId: thread.tenantId ?? undefined,
          recipientId: thread.authorId,
          actorId: userId,
          type: "thread_pin",
          targetType: "thread",
          targetId: args.threadId,
          title: `${modName} ${action} your thread`,
          message: thread.title.slice(0, 120),
        });
      }

      if (args.isLocked !== undefined) {
        const action = args.isLocked ? "locked" : "unlocked";
        await insertNotification(ctx, {
          tenantId: thread.tenantId ?? undefined,
          recipientId: thread.authorId,
          actorId: userId,
          type: "thread_lock",
          targetType: "thread",
          targetId: args.threadId,
          title: `${modName} ${action} your thread`,
          message: thread.title.slice(0, 120),
        });
      }
    }

    return true;
  },
});

export const deleteThread = authenticatedMutation({
  args: { threadId: v.id("forumThreads") },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const thread = await getThreadById(ctx, args.threadId);
    if (!thread || thread.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Thread not found");
    }

    await canDeleteThread(ctx, thread.authorId, userId);

    const now = Date.now();
    await patchThread(ctx, args.threadId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    const category = await getCategoryById(ctx, thread.categoryId);
    if (category) {
      await patchCategory(ctx, thread.categoryId, {
        threadCount: Math.max(0, category.threadCount - 1),
        postCount: Math.max(0, category.postCount - thread.postCount),
        updatedAt: now,
      });
    }

    return true;
  },
});

// ============================================================================
// Post Mutations
// ============================================================================

export const createPost = authenticatedMutation({
  args: {
    threadId: v.id("forumThreads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const thread = await getThreadById(ctx, args.threadId);
    if (!thread || thread.isDeleted) {
      throw new Error("Thread not found");
    }
    if (thread.isLocked) {
      throw new Error("Thread is locked");
    }

    validatePostContent(args.content);
    const now = Date.now();

    const postId = await insertPost(ctx, {
      tenantId: thread.tenantId,
      threadId: args.threadId,
      authorId: userId,
      content: args.content,
      status: "published",
      isFirstPost: false,
      likeCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    await patchThread(ctx, args.threadId, {
      postCount: thread.postCount + 1,
      lastPostAt: now,
      lastPostUserId: userId,
      updatedAt: now,
    });

    const category = await getCategoryById(ctx, thread.categoryId);
    if (category) {
      await patchCategory(ctx, thread.categoryId, {
        postCount: category.postCount + 1,
        lastPostAt: now,
        updatedAt: now,
      });
    }

    // Notification: reply to thread author
    const actorAuthor = await enrichAuthor(ctx, userId);
    const actorName = actorAuthor?.displayName ?? "Someone";

    await insertNotification(ctx, {
      tenantId: thread.tenantId ?? undefined,
      recipientId: thread.authorId,
      actorId: userId,
      type: "reply",
      targetType: "thread",
      targetId: args.threadId,
      title: `${actorName} replied to your thread`,
      message: args.content.slice(0, 120),
    });

    // Notification: @mentions
    const mentionedUsernames = parseMentions(args.content);
    for (const username of mentionedUsernames) {
      const mentionedProfile = await getProfileByUsername(ctx, username);
      if (mentionedProfile && mentionedProfile.userId !== userId) {
        await insertNotification(ctx, {
          tenantId: thread.tenantId ?? undefined,
          recipientId: mentionedProfile.userId,
          actorId: userId,
          type: "mention",
          targetType: "post",
          targetId: postId,
          title: `${actorName} mentioned you`,
          message: args.content.slice(0, 120),
        });
      }
    }

    return postId;
  },
});

export const updatePost = authenticatedMutation({
  args: {
    postId: v.id("forumPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const post = await getPostById(ctx, args.postId);
    if (!post || post.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Post not found");
    }

    await canEditPost(ctx, post.authorId, userId);
    validatePostContent(args.content);

    const now = Date.now();
    await patchPost(ctx, args.postId, {
      content: args.content,
      editedAt: now,
      editedBy: userId,
      updatedAt: now,
    });

    return true;
  },
});

export const deletePost = authenticatedMutation({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const post = await getPostById(ctx, args.postId);
    if (!post || post.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Post not found");
    }

    if (post.isFirstPost) {
      throw createError(
        ErrorCode.VALIDATION_FAILED,
        "Cannot delete the first post. Delete the thread instead."
      );
    }

    await canDeletePost(ctx, post.authorId, userId);

    const now = Date.now();
    await patchPost(ctx, args.postId, {
      isDeleted: true,
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
    });

    const thread = await getThreadById(ctx, post.threadId);
    if (thread) {
      await patchThread(ctx, post.threadId, {
        postCount: Math.max(1, thread.postCount - 1),
        updatedAt: now,
      });

      const category = await getCategoryById(ctx, thread.categoryId);
      if (category) {
        await patchCategory(ctx, thread.categoryId, {
          postCount: Math.max(0, category.postCount - 1),
          updatedAt: now,
        });
      }
    }

    return true;
  },
});

// ============================================================================
// Comment Mutations
// ============================================================================

export const createComment = authenticatedMutation({
  args: {
    postId: v.id("forumPosts"),
    content: v.string(),
    parentId: v.optional(v.id("forumComments")),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const post = await getPostById(ctx, args.postId);
    if (!post || post.isDeleted) {
      throw new Error("Post not found");
    }

    const thread = await getThreadById(ctx, post.threadId);
    if (thread?.isLocked) {
      throw new Error("Thread is locked");
    }

    if (args.parentId) {
      const parentComment = await getCommentById(ctx, args.parentId);
      if (!parentComment || parentComment.isDeleted) {
        throw new Error("Parent comment not found");
      }
      if (parentComment.postId !== args.postId) {
        throw new Error("Parent comment must be on the same post");
      }
    }

    validateCommentContent(args.content);
    const now = Date.now();

    const commentId = await insertComment(ctx, {
      tenantId: post.tenantId,
      postId: args.postId,
      authorId: userId,
      parentId: args.parentId,
      content: args.content,
      likeCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Notification: reply to post/comment author
    const commentActor = await enrichAuthor(ctx, userId);
    const commentActorName = commentActor?.displayName ?? "Someone";

    if (args.parentId) {
      const parentComment = await getCommentById(ctx, args.parentId);
      if (parentComment && parentComment.authorId !== userId) {
        await insertNotification(ctx, {
          tenantId: post.tenantId ?? undefined,
          recipientId: parentComment.authorId,
          actorId: userId,
          type: "reply",
          targetType: "comment",
          targetId: commentId,
          title: `${commentActorName} replied to your comment`,
          message: args.content.slice(0, 120),
        });
      }
    } else {
      if (post.authorId !== userId) {
        await insertNotification(ctx, {
          tenantId: post.tenantId ?? undefined,
          recipientId: post.authorId,
          actorId: userId,
          type: "reply",
          targetType: "post",
          targetId: args.postId,
          title: `${commentActorName} commented on your post`,
          message: args.content.slice(0, 120),
        });
      }
    }

    // Notification: @mentions
    const commentMentions = parseMentions(args.content);
    for (const username of commentMentions) {
      const mentionedProfile = await getProfileByUsername(ctx, username);
      if (mentionedProfile && mentionedProfile.userId !== userId) {
        await insertNotification(ctx, {
          tenantId: post.tenantId ?? undefined,
          recipientId: mentionedProfile.userId,
          actorId: userId,
          type: "mention",
          targetType: "comment",
          targetId: commentId,
          title: `${commentActorName} mentioned you`,
          message: args.content.slice(0, 120),
        });
      }
    }

    return commentId;
  },
});

export const deleteComment = authenticatedMutation({
  args: { commentId: v.id("forumComments") },
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    const comment = await getCommentById(ctx, args.commentId);
    if (!comment || comment.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Comment not found");
    }

    await canDeleteComment(ctx, comment.authorId, userId);

    const now = Date.now();
    await patchComment(ctx, args.commentId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    return true;
  },
});

export const incrementThreadViewCount = mutation({
  args: { threadId: v.id("forumThreads") },
  handler: async (ctx, args) => {
    const thread = await getThreadById(ctx, args.threadId);
    if (!thread || thread.isDeleted) return;

    await patchThread(ctx, args.threadId, {
      viewCount: thread.viewCount + 1,
    });
  },
});

// ============================================================================
// Feed & Discovery Queries
// ============================================================================

/**
 * Helper to enrich a thread with author, category, tags, flair.
 */
async function enrichThreadForFeed(
  ctx: Parameters<typeof enrichAuthor>[0] & Pick<import("../_generated/server").QueryCtx, "db">,
  thread: Doc<"forumThreads">
) {
  const author = await enrichAuthor(ctx, thread.authorId);
  const category = await getCategoryById(ctx, thread.categoryId);
  const tags = (await getThreadTags(ctx, thread._id)).map(toTagInfo);

  let flair = null;
  if (thread.flairId) {
    const flairDoc = await getFlairById(ctx, thread.flairId);
    if (flairDoc) flair = toFlairInfo(flairDoc);
  }

  return toThreadListItem(thread, author, category, tags, flair);
}

export const listDiscussions = query({
  args: {
    sortBy: v.optional(
      v.union(
        v.literal("top"),
        v.literal("hot"),
        v.literal("new"),
        v.literal("controversial")
      )
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const sortBy = args.sortBy ?? "new";

    let threads: Doc<"forumThreads">[];
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as never);
      if (cursorDoc) {
        const cursorCreatedAt = (cursorDoc as { createdAt: number }).createdAt;
        threads = await getThreadsBeforeCursor(ctx, cursorCreatedAt, limit * 2);
      } else {
        threads = [];
      }
    } else {
      threads = await getRecentThreads(ctx, limit * 2);
    }

    const sorted = sortThreads([...threads], sortBy);
    const result = sorted.slice(0, limit);

    const enriched = await Promise.all(
      result.map((thread) => enrichThreadForFeed(ctx, thread))
    );

    return {
      discussions: enriched,
      hasMore: threads.length > limit,
      nextCursor:
        enriched.length > 0
          ? enriched[enriched.length - 1]?._id ?? null
          : null,
    };
  },
});

export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()),
    period: v.optional(
      v.union(
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("allTime")
      )
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const period = args.period ?? "weekly";

    const entries = await getLeaderboardEntries(ctx, period, limit);

    const leaderboard = await Promise.all(
      entries.map(async (entry, index) => {
        const user = await enrichAuthor(ctx, entry.userId);
        return toLeaderboardEntry(entry, user, index + 1, period);
      })
    );

    return leaderboard.filter((e) => e.user !== null);
  },
});

export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("userProfiles").take(100000);
    const memberCount = profiles.length;

    const threads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(100000);
    const threadCount = threads.length;

    const categories = await ctx.db.query("forumCategories").collect();
    const postCount = categories.reduce(
      (sum, cat) => sum + cat.postCount,
      0
    );

    return {
      members: formatCount(memberCount),
      discussions: formatCount(threadCount),
      comments: formatCount(postCount),
    };
  },
});

export const getTrendingTopics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const recentThreads = await getRecentThreads(ctx, 50);

    const scored = recentThreads.map((thread) => ({
      thread,
      score: scoreForTrending(thread),
    }));
    scored.sort((a, b) => b.score - a.score);
    const topThreads = scored.slice(0, limit);

    return Promise.all(
      topThreads.map(async ({ thread, score }) => {
        const category = await getCategoryById(ctx, thread.categoryId);
        return {
          id: thread._id,
          title: thread.title,
          category: category?.name ?? "General",
          posts: thread.postCount,
          trend: (score > 50 ? "hot" : "rising") as "hot" | "rising",
        };
      })
    );
  },
});

export const getActiveCampaign = query({
  args: {},
  handler: async (ctx) => {
    const campaign = await repoActiveCampaign(ctx);
    if (!campaign) return null;

    return {
      id: campaign._id,
      title: campaign.title,
      description: campaign.description,
      prize: campaign.prize,
      endDate: campaign.endDate,
      progress: campaign.currentProgress,
      targetPoints: campaign.targetPoints,
      participantCount: campaign.participantCount,
    };
  },
});

// ============================================================================
// Reaction System
// ============================================================================

export const toggleReaction = authenticatedMutation({
  args: {
    targetType: v.union(
      v.literal("thread"),
      v.literal("post"),
      v.literal("comment")
    ),
    targetId: v.string(),
    reactionType: v.union(
      v.literal("upvote"),
      v.literal("downvote"),
      v.literal("bookmark")
    ),
  },
  handler: async (ctx, args) => {
    const userId = ctx.userId;

    const existing = await getReactionByUserTarget(
      ctx,
      userId,
      args.targetType,
      args.targetId
    );

    let deltaUp = 0;
    let deltaDown = 0;
    let deltaBookmark = 0;
    let action: "added" | "removed" | "switched";

    if (existing && existing.reactionType === args.reactionType) {
      await deleteReaction(ctx, existing._id);
      if (args.reactionType === "upvote") deltaUp = -1;
      else if (args.reactionType === "downvote") deltaDown = -1;
      else if (args.reactionType === "bookmark") deltaBookmark = -1;
      action = "removed";
    } else if (existing) {
      const oldType = existing.reactionType;
      await deleteReaction(ctx, existing._id);
      if (oldType === "upvote") deltaUp = -1;
      else if (oldType === "downvote") deltaDown = -1;
      else if (oldType === "bookmark") deltaBookmark = -1;

      await insertReaction(ctx, {
        userId,
        targetType: args.targetType,
        targetId: args.targetId,
        reactionType: args.reactionType,
        createdAt: Date.now(),
      });
      if (args.reactionType === "upvote") deltaUp += 1;
      else if (args.reactionType === "downvote") deltaDown += 1;
      else if (args.reactionType === "bookmark") deltaBookmark += 1;
      action = "switched";
    } else {
      await insertReaction(ctx, {
        userId,
        targetType: args.targetType,
        targetId: args.targetId,
        reactionType: args.reactionType,
        createdAt: Date.now(),
      });
      if (args.reactionType === "upvote") deltaUp = 1;
      else if (args.reactionType === "downvote") deltaDown = 1;
      else if (args.reactionType === "bookmark") deltaBookmark = 1;
      action = "added";
    }

    // Update denormalized counts on thread
    if (
      args.targetType === "thread" &&
      (deltaUp !== 0 || deltaDown !== 0 || deltaBookmark !== 0)
    ) {
      const thread = (await ctx.db.get(
        args.targetId as never
      )) as Doc<"forumThreads"> | null;
      if (thread) {
        const newUp = Math.max(0, (thread.upvoteCount ?? 0) + deltaUp);
        const newDown = Math.max(0, (thread.downvoteCount ?? 0) + deltaDown);
        const patchData: Partial<Doc<"forumThreads">> = {};
        if (deltaUp !== 0) {
          patchData.upvoteCount = newUp;
          patchData.score = newUp - newDown;
        }
        if (deltaDown !== 0) {
          patchData.downvoteCount = newDown;
          patchData.score = newUp - newDown;
        }
        if (deltaBookmark !== 0) {
          patchData.bookmarkCount = Math.max(
            0,
            (thread.bookmarkCount ?? 0) + deltaBookmark
          );
        }
        await ctx.db.patch(args.targetId as never, patchData as never);

        // Notification: upvote milestone
        if (deltaUp > 0 && isUpvoteMilestone(newUp)) {
          const upvoteActor = await enrichAuthor(ctx, userId);
          const upvoteActorName = upvoteActor?.displayName ?? "Someone";

          await insertNotification(ctx, {
            tenantId: thread.tenantId ?? undefined,
            recipientId: thread.authorId,
            actorId: userId,
            type: "upvote",
            targetType: "thread",
            targetId: args.targetId,
            title: `Your thread reached ${newUp} upvotes!`,
            message: `${upvoteActorName} and others upvoted your thread`,
          });
        }
      }
    }

    return { action };
  },
});

export const getUserReactions = query({
  args: {
    targetType: v.union(
      v.literal("thread"),
      v.literal("post"),
      v.literal("comment")
    ),
    targetIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const reactions: Record<string, string> = {};
    for (const targetId of args.targetIds) {
      const reaction = await getReactionByUserTarget(
        ctx,
        userId,
        args.targetType,
        targetId
      );
      if (reaction) {
        reactions[targetId] = reaction.reactionType;
      }
    }

    return reactions;
  },
});

// ============================================================================
// User Profile & Content Queries
// ============================================================================

export const getUserProfile = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await getProfileByUsername(ctx, args.username);
    if (!profile) return null;

    const user = await ctx.db.get(profile.userId);
    const threads = await getThreadsByAuthor(ctx, profile.userId, 10000);
    const posts = await getPostsByAuthor(ctx, profile.userId, 10000);
    const points = await getUserPoints(ctx, profile.userId);

    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName ?? user?.name ?? "Anonymous",
      avatarUrl: profile.avatarUrl ?? null,
      bio: profile.bio ?? null,
      role: profile.defaultRole,
      joinedAt: profile.createdAt,
      threadCount: threads.length,
      postCount: posts.length,
      reputation: points?.totalPoints ?? 0,
      followerCount: profile.followerCount ?? 0,
      followingCount: profile.followingCount ?? 0,
    };
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const category = await repoCategoryBySlug(ctx, args.slug);
    if (!category || !category.isActive) return null;

    return {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "\u{1F4AC}",
      color: category.color ?? null,
      threadCount: category.threadCount,
      postCount: category.postCount,
    };
  },
});

export const listThreadsBySlug = query({
  args: {
    slug: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    sort: v.optional(
      v.union(
        v.literal("recent"),
        v.literal("popular"),
        v.literal("unanswered")
      )
    ),
  },
  handler: async (ctx, args) => {
    const category = await repoCategoryBySlug(ctx, args.slug);
    if (!category || !category.isActive) return null;

    const limit = args.limit ?? 20;

    let threads: Doc<"forumThreads">[];
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as never);
      if (cursorDoc) {
        const cursorCreatedAt = (cursorDoc as { createdAt: number }).createdAt;
        threads = await getThreadsBeforeCursor(
          ctx,
          cursorCreatedAt,
          limit + 1,
          category._id
        );
      } else {
        threads = [];
      }
    } else {
      threads = await getThreadsByCategory(ctx, category._id, {
        limit: limit + 1,
      });
    }

    const hasMore = threads.length > limit;
    const result = hasMore ? threads.slice(0, limit) : threads;

    if (args.sort === "popular") {
      result.sort(
        (a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0)
      );
    }

    const enriched = await Promise.all(
      result.map((thread) => enrichThreadForFeed(ctx, thread))
    );

    return {
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        icon: category.icon ?? "\u{1F4AC}",
        threadCount: category.threadCount,
      },
      threads: enriched,
      hasMore,
      nextCursor:
        enriched.length > 0
          ? enriched[enriched.length - 1]?._id ?? null
          : null,
    };
  },
});

export const getUserThreads = query({
  args: {
    username: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const profile = await getProfileByUsername(ctx, args.username);
    if (!profile) return [];

    const threads = await getThreadsByAuthor(ctx, profile.userId, limit);

    return Promise.all(
      threads.map(async (thread) => {
        const category = await getCategoryById(ctx, thread.categoryId);
        return {
          id: thread._id,
          title: thread.title,
          slug: thread.slug,
          createdAt: thread.createdAt,
          postCount: thread.postCount,
          viewCount: thread.viewCount,
          upvoteCount: thread.upvoteCount ?? 0,
          isPinned: thread.isPinned,
          isLocked: thread.isLocked,
          category: category
            ? {
                name: category.name,
                slug: category.slug,
                icon: category.icon ?? null,
              }
            : null,
        };
      })
    );
  },
});

export const getUserReplies = query({
  args: {
    username: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const profile = await getProfileByUsername(ctx, args.username);
    if (!profile) return [];

    const posts = await getPostsByAuthor(ctx, profile.userId, limit, {
      excludeFirstPost: true,
    });

    return Promise.all(
      posts.map(async (post) => {
        const thread = await getThreadById(ctx, post.threadId);
        return {
          id: post._id,
          content: post.content.slice(0, 300),
          createdAt: post.createdAt,
          threadId: post.threadId,
          threadTitle: thread?.title ?? "Deleted thread",
        };
      })
    );
  },
});

export const getBookmarkedThreads = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 20;
    const bookmarks = await getUserBookmarks(ctx, userId, limit);

    const threads = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const thread = (await ctx.db.get(
          bookmark.targetId as never
        )) as Doc<"forumThreads"> | null;
        if (!thread || thread.isDeleted) return null;

        const author = await enrichAuthor(ctx, thread.authorId);
        const category = await getCategoryById(ctx, thread.categoryId);

        return {
          bookmarkedAt: bookmark.createdAt,
          thread: {
            id: thread._id,
            title: thread.title,
            slug: thread.slug,
            createdAt: thread.createdAt,
            postCount: thread.postCount,
            viewCount: thread.viewCount,
            upvoteCount: thread.upvoteCount ?? 0,
            isPinned: thread.isPinned,
            isLocked: thread.isLocked,
            author: author
              ? {
                  id: author.id,
                  name: author.name,
                  username: author.username ?? String(author.id),
                  avatarUrl: author.avatarUrl ?? null,
                }
              : null,
            category: category
              ? {
                  name: category.name,
                  slug: category.slug,
                  icon: category.icon ?? null,
                }
              : null,
          },
        };
      })
    );

    return threads.filter(Boolean);
  },
});
