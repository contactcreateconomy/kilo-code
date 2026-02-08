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

/**
 * Forum Management Functions
 *
 * Queries and mutations for managing forum categories, threads, posts, and comments
 * in the Createconomy community forum.
 */

interface ForumCategoryTreeNode extends Doc<"forumCategories"> {
  children?: ForumCategoryTreeNode[];
}

interface CommentTreeNode {
  _id: string;
  _creationTime: number;
  tenantId?: string;
  postId: string;
  authorId: string;
  parentId?: string;
  content: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  author: {
    id: string;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
  } | null;
  replies?: CommentTreeNode[];
}

// ============================================================================
// Category Queries
// ============================================================================

/**
 * List forum categories
 *
 * @param tenantId - Optional tenant filter
 * @returns List of forum categories with stats
 */
export const listForumCategories = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    let categoriesQuery;

    if (args.tenantId) {
      categoriesQuery = ctx.db
        .query("forumCategories")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    } else {
      categoriesQuery = ctx.db.query("forumCategories");
    }

    const categories = await categoriesQuery
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Sort by sortOrder
    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    // Build tree structure
    const rootCategories = categories.filter((c) => !c.parentId);
    const childCategories = categories.filter((c) => c.parentId);

    function buildTree(parent: (typeof categories)[0]): ForumCategoryTreeNode {
      const children: ForumCategoryTreeNode[] = childCategories
        .filter((c) => c.parentId === parent._id)
        .map((child) => buildTree(child));

      return {
        ...parent,
        children: children.length > 0 ? children : undefined,
      };
    }

    return rootCategories.map(buildTree);
  },
});

/**
 * Get a single forum category
 *
 * @param categoryId - Category ID
 * @returns Category with recent threads
 */
export const getForumCategory = query({
  args: {
    categoryId: v.id("forumCategories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category || !category.isActive) {
      return null;
    }

    // Get recent threads
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(10);

    return {
      ...category,
      recentThreads: threads,
    };
  },
});

// ============================================================================
// Thread Queries
// ============================================================================

/**
 * List threads in a category
 *
 * @param categoryId - Category ID
 * @param limit - Number of threads to return
 * @param cursor - Pagination cursor
 * @returns Paginated list of threads
 */
export const listThreads = query({
  args: {
    categoryId: v.id("forumCategories"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    // Get pinned threads first
    const pinnedThreads = await ctx.db
      .query("forumThreads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("isPinned"), true)
        )
      )
      .collect();

    // Get regular threads
    const regularThreads = await ctx.db
      .query("forumThreads")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("isPinned"), false)
        )
      )
      .order("desc")
      .take(limit + 1);

    const hasMore = regularThreads.length > limit;
    const threads = hasMore ? regularThreads.slice(0, limit) : regularThreads;

    // Get author info for all threads
    const allThreads = [...pinnedThreads, ...threads];
    const threadsWithAuthors = await Promise.all(
      allThreads.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const authorProfile = author
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", author._id))
              .first()
          : null;

        const lastPostUser = thread.lastPostUserId
          ? await ctx.db.get(thread.lastPostUserId)
          : null;

        return {
          ...thread,
          author: author
            ? {
                id: author._id,
                name: author.name,
                displayName: authorProfile?.displayName,
                avatarUrl: authorProfile?.avatarUrl,
              }
            : null,
          lastPostUser: lastPostUser
            ? {
                id: lastPostUser._id,
                name: lastPostUser.name,
              }
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

/**
 * Get a single thread with posts
 *
 * @param threadId - Thread ID
 * @param postLimit - Number of posts to return
 * @returns Thread with posts
 */
export const getThread = query({
  args: {
    threadId: v.id("forumThreads"),
    postLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      return null;
    }

    const postLimit = args.postLimit ?? 20;

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

    // Get posts
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("status"), "published")
        )
      )
      .order("asc")
      .take(postLimit);

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = await ctx.db.get(post.authorId);
        const postAuthorProfile = postAuthor
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", postAuthor._id))
              .first()
          : null;

        // Get comment count
        const comments = await ctx.db
          .query("forumComments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect();

        return {
          ...post,
          author: postAuthor
            ? {
                id: postAuthor._id,
                name: postAuthor.name,
                displayName: postAuthorProfile?.displayName,
                avatarUrl: postAuthorProfile?.avatarUrl,
                role: postAuthorProfile?.defaultRole,
              }
            : null,
          commentCount: comments.length,
        };
      })
    );

    return {
      ...thread,
      author: author
        ? {
            id: author._id,
            name: author.name,
            displayName: authorProfile?.displayName,
            avatarUrl: authorProfile?.avatarUrl,
          }
        : null,
      category: category
        ? {
            id: category._id,
            name: category.name,
            slug: category.slug,
          }
        : null,
      posts: postsWithAuthors,
    };
  },
});

/**
 * Search threads
 *
 * @param query - Search query
 * @param tenantId - Optional tenant filter
 * @param categoryId - Optional category filter
 * @param limit - Number of results
 * @returns Search results
 */
export const searchThreads = query({
  args: {
    query: v.string(),
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.optional(v.id("forumCategories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let searchQuery = ctx.db
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

    const threads = await searchQuery.take(limit);

    return threads;
  },
});

// ============================================================================
// Post and Comment Queries
// ============================================================================

/**
 * Get comments for a post
 *
 * @param postId - Post ID
 * @returns List of comments
 */
export const getPostComments = query({
  args: {
    postId: v.id("forumPosts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("forumComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Get author info for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        const authorProfile = author
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", author._id))
              .first()
          : null;

        return {
          ...comment,
          author: author
            ? {
                id: author._id,
                name: author.name,
                displayName: authorProfile?.displayName,
                avatarUrl: authorProfile?.avatarUrl,
              }
            : null,
        };
      })
    );

    // Build tree structure for nested comments
    const rootComments = commentsWithAuthors.filter((c) => !c.parentId);
    const childComments = commentsWithAuthors.filter((c) => c.parentId);

    type CommentWithAuthor = (typeof commentsWithAuthors)[0];

    const buildTree = (parent: CommentWithAuthor): CommentTreeNode => {
      const children = childComments
        .filter((c) => c.parentId === parent._id)
        .map((child) => buildTree(child));

      return {
        ...parent,
        replies: children.length > 0 ? children : undefined,
      };
    };

    return rootComments.map(buildTree);
  },
});

// ============================================================================
// Thread Mutations
// ============================================================================

/**
 * Create a new thread
 *
 * @param categoryId - Category ID
 * @param title - Thread title
 * @param content - First post content
 * @returns Created thread ID
 */
export const createThread = mutation({
  args: {
    categoryId: v.id("forumCategories"),
    title: v.string(),
    content: v.string(),
    tenantId: v.optional(v.id("tenants")),
    // Phase 3: Post type support
    postType: v.optional(
      v.union(
        v.literal("text"),
        v.literal("link"),
        v.literal("image"),
        v.literal("poll")
      )
    ),
    // Link post fields
    linkUrl: v.optional(v.string()),
    linkDomain: v.optional(v.string()),
    linkTitle: v.optional(v.string()),
    linkDescription: v.optional(v.string()),
    linkImage: v.optional(v.string()),
    // Image post fields
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
    // Poll fields
    pollOptions: v.optional(v.array(v.string())),
    pollEndsAt: v.optional(v.number()),
    pollMultiSelect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Check ban/mute status before allowing content creation
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const postType = args.postType ?? "text";

    // Validate category
    const category = await ctx.db.get(args.categoryId);
    if (!category || !category.isActive) {
      throw new Error("Category not found");
    }

    // Validate title
    if (args.title.length < 5) {
      throw new Error("Title must be at least 5 characters");
    }
    if (args.title.length > 200) {
      throw new Error("Title must be less than 200 characters");
    }

    // Type-specific validation
    if (postType === "text") {
      if (args.content.length < 10) {
        throw new Error("Content must be at least 10 characters");
      }
    } else if (postType === "link") {
      if (!args.linkUrl) {
        throw new Error("URL is required for link posts");
      }
      // Basic URL validation
      try {
        const parsed = new URL(args.linkUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("URL must use http or https protocol");
        }
      } catch {
        throw new Error("Invalid URL");
      }
    } else if (postType === "image") {
      if (!args.images || args.images.length === 0) {
        throw new Error("At least one image is required for image posts");
      }
      if (args.images.length > 20) {
        throw new Error("Maximum 20 images per post");
      }
    } else if (postType === "poll") {
      if (!args.pollOptions || args.pollOptions.length < 2) {
        throw new Error("At least 2 options are required for polls");
      }
      if (args.pollOptions.length > 10) {
        throw new Error("Maximum 10 poll options");
      }
      // Validate each option is non-empty
      for (const option of args.pollOptions) {
        if (option.trim().length === 0) {
          throw new Error("Poll options cannot be empty");
        }
      }
    }

    const now = Date.now();

    // Generate slug
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100) + `-${now}`;

    // Extract domain from link URL
    let linkDomain = args.linkDomain;
    if (postType === "link" && args.linkUrl && !linkDomain) {
      try {
        linkDomain = new URL(args.linkUrl).hostname.replace(/^www\./, "");
      } catch {
        // ignore
      }
    }

    // Create thread
    const threadId = await ctx.db.insert("forumThreads", {
      tenantId: args.tenantId ?? category.tenantId,
      categoryId: args.categoryId,
      authorId: userId,
      title: args.title,
      slug,
      body: postType === "text" ? args.content : (args.content || undefined),
      postType,
      // Link fields
      ...(postType === "link"
        ? {
            linkUrl: args.linkUrl,
            linkDomain,
            linkTitle: args.linkTitle,
            linkDescription: args.linkDescription,
            linkImage: args.linkImage,
          }
        : {}),
      // Image fields
      ...(postType === "image"
        ? {
            images: args.images,
          }
        : {}),
      // Poll fields
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

    // Create first post (for backward compatibility with old system)
    await ctx.db.insert("forumPosts", {
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

    // Update category stats
    await ctx.db.patch(args.categoryId, {
      threadCount: category.threadCount + 1,
      postCount: category.postCount + 1,
      lastPostAt: now,
      updatedAt: now,
    });

    return threadId;
  },
});

/**
 * Update thread (author or moderator)
 *
 * @param threadId - Thread ID
 * @param title - New title
 * @returns Success boolean
 */
export const updateThread = mutation({
  args: {
    threadId: v.id("forumThreads"),
    title: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    isLocked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      throw new Error("Thread not found");
    }

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    // Only author can update title
    if (args.title !== undefined && thread.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized to update this thread");
    }

    // Only mods/admins can pin or lock
    if ((args.isPinned !== undefined || args.isLocked !== undefined) && !isModOrAdmin) {
      throw new Error("Moderator role required");
    }

    // Validate title if provided
    if (args.title !== undefined) {
      if (args.title.length < 5) {
        throw new Error("Title must be at least 5 characters");
      }
      if (args.title.length > 200) {
        throw new Error("Title must be less than 200 characters");
      }
    }

    const { threadId, ...updates } = args;

    await ctx.db.patch(args.threadId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // --- Notification: Thread pinned or locked by mod ---
    if (
      (args.isPinned !== undefined || args.isLocked !== undefined) &&
      thread.authorId !== userId
    ) {
      const modProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      const modName = modProfile?.displayName ?? "A moderator";

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

/**
 * Delete thread (soft delete)
 *
 * @param threadId - Thread ID
 * @returns Success boolean
 */
export const deleteThread = mutation({
  args: {
    threadId: v.id("forumThreads"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      throw new Error("Thread not found");
    }

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (thread.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized to delete this thread");
    }

    const now = Date.now();

    await ctx.db.patch(args.threadId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    // Update category stats
    const category = await ctx.db.get(thread.categoryId);
    if (category) {
      await ctx.db.patch(thread.categoryId, {
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

/**
 * Create a post (reply to thread)
 *
 * @param threadId - Thread ID
 * @param content - Post content
 * @returns Created post ID
 */
export const createPost = mutation({
  args: {
    threadId: v.id("forumThreads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Check ban/mute status before allowing content creation
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      throw new Error("Thread not found");
    }

    if (thread.isLocked) {
      throw new Error("Thread is locked");
    }

    // Validate content
    if (args.content.length < 10) {
      throw new Error("Content must be at least 10 characters");
    }

    const now = Date.now();

    // Create post
    const postId = await ctx.db.insert("forumPosts", {
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

    // Update thread
    await ctx.db.patch(args.threadId, {
      postCount: thread.postCount + 1,
      lastPostAt: now,
      lastPostUserId: userId,
      updatedAt: now,
    });

    // Update category
    const category = await ctx.db.get(thread.categoryId);
    if (category) {
      await ctx.db.patch(thread.categoryId, {
        postCount: category.postCount + 1,
        lastPostAt: now,
        updatedAt: now,
      });
    }

    // --- Notification: Reply to thread author ---
    const actorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const actorName = actorProfile?.displayName ?? "Someone";

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

    // --- Notification: @mentions in post content ---
    const mentionedUsernames = parseMentions(args.content);
    for (const username of mentionedUsernames) {
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

/**
 * Update a post
 *
 * @param postId - Post ID
 * @param content - New content
 * @returns Success boolean
 */
export const updatePost = mutation({
  args: {
    postId: v.id("forumPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      throw new Error("Post not found");
    }

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (post.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized to update this post");
    }

    // Validate content
    if (args.content.length < 10) {
      throw new Error("Content must be at least 10 characters");
    }

    const now = Date.now();

    await ctx.db.patch(args.postId, {
      content: args.content,
      editedAt: now,
      editedBy: userId,
      updatedAt: now,
    });

    return true;
  },
});

/**
 * Delete a post (soft delete)
 *
 * @param postId - Post ID
 * @returns Success boolean
 */
export const deletePost = mutation({
  args: {
    postId: v.id("forumPosts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      throw new Error("Post not found");
    }

    // Can't delete first post (delete thread instead)
    if (post.isFirstPost) {
      throw new Error("Cannot delete the first post. Delete the thread instead.");
    }

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (post.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized to delete this post");
    }

    const now = Date.now();

    await ctx.db.patch(args.postId, {
      isDeleted: true,
      deletedAt: now,
      deletedBy: userId,
      updatedAt: now,
    });

    // Update thread post count
    const thread = await ctx.db.get(post.threadId);
    if (thread) {
      await ctx.db.patch(post.threadId, {
        postCount: Math.max(1, thread.postCount - 1),
        updatedAt: now,
      });

      // Update category
      const category = await ctx.db.get(thread.categoryId);
      if (category) {
        await ctx.db.patch(thread.categoryId, {
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

/**
 * Create a comment on a post
 *
 * @param postId - Post ID
 * @param content - Comment content
 * @param parentId - Parent comment ID for replies
 * @returns Created comment ID
 */
export const createComment = mutation({
  args: {
    postId: v.id("forumPosts"),
    content: v.string(),
    parentId: v.optional(v.id("forumComments")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Check ban/mute status before allowing content creation
    await checkBanStatus(ctx, userId);
    await checkMuteStatus(ctx, userId);

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      throw new Error("Post not found");
    }

    // Check if thread is locked
    const thread = await ctx.db.get(post.threadId);
    if (thread?.isLocked) {
      throw new Error("Thread is locked");
    }

    // Validate parent comment if provided
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment || parentComment.isDeleted) {
        throw new Error("Parent comment not found");
      }
      if (parentComment.postId !== args.postId) {
        throw new Error("Parent comment must be on the same post");
      }
    }

    // Validate content
    if (args.content.length < 1) {
      throw new Error("Content is required");
    }
    if (args.content.length > 2000) {
      throw new Error("Content must be less than 2000 characters");
    }

    const now = Date.now();

    const commentId = await ctx.db.insert("forumComments", {
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

    // --- Notification: Reply to post/comment author ---
    const commentActorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const commentActorName = commentActorProfile?.displayName ?? "Someone";

    if (args.parentId) {
      // Replying to a comment — notify the parent comment's author
      const parentComment = await ctx.db.get(args.parentId);
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
      // Top-level comment on a post — notify the post's author
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

    // --- Notification: @mentions in comment content ---
    const commentMentions = parseMentions(args.content);
    for (const username of commentMentions) {
      const mentionedProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
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

/**
 * Delete a comment (soft delete)
 *
 * @param commentId - Comment ID
 * @returns Success boolean
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("forumComments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted) {
      throw new Error("Comment not found");
    }

    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isModOrAdmin =
      profile?.defaultRole === "admin" || profile?.defaultRole === "moderator";

    if (comment.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized to delete this comment");
    }

    const now = Date.now();

    await ctx.db.patch(args.commentId, {
      isDeleted: true,
      deletedAt: now,
      updatedAt: now,
    });

    return true;
  },
});

/**
 * Increment thread view count
 *
 * @param threadId - Thread ID
 */
export const incrementThreadViewCount = mutation({
  args: {
    threadId: v.id("forumThreads"),
  },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.isDeleted) {
      return;
    }

    await ctx.db.patch(args.threadId, {
      viewCount: thread.viewCount + 1,
    });
  },
});

// ============================================================================
// Feed & Discovery Queries (for forum homepage)
// ============================================================================

/**
 * Helper to format counts like "24.5K", "1.2M"
 */
function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Calculate controversy score for a thread.
 *
 * High engagement + polarized votes = high controversy.
 * Balance is highest (1) when up ≈ down, lowest (0) when one dominates.
 * Requires minimum 5 total votes to avoid noise.
 */
function calculateControversy(thread: {
  upvoteCount?: number;
  downvoteCount?: number;
}): number {
  const up = thread.upvoteCount ?? 0;
  const down = thread.downvoteCount ?? 0;
  const total = up + down;

  if (total < 5) return 0; // Need minimum engagement

  const balance = 1 - Math.abs(up - down) / total;
  return total * balance;
}

/**
 * List discussions for the homepage feed
 *
 * Fetches threads across ALL categories with author + category info.
 * Supports sorting by "top" (upvotes), "hot" (engagement × recency), "new" (creation time).
 *
 * @param sortBy - Sort order
 * @param limit - Max results
 * @returns Enriched discussions with hasMore flag
 */
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

    // Fetch threads — if cursor provided, filter to those created before cursor doc
    let threads: Doc<"forumThreads">[];
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
          .take(limit * 2);
      } else {
        threads = [];
      }
    } else {
      threads = await ctx.db
        .query("forumThreads")
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .take(limit * 2);
    }

    // Sort based on sortBy
    let sorted = [...threads];
    if (sortBy === "top") {
      sorted.sort((a, b) => (b.score ?? (b.upvoteCount ?? 0)) - (a.score ?? (a.upvoteCount ?? 0)));
    } else if (sortBy === "hot") {
      sorted.sort((a, b) => {
        const scoreA =
          (a.score ?? (a.upvoteCount ?? 0)) + a.postCount * 2;
        const scoreB =
          (b.score ?? (b.upvoteCount ?? 0)) + b.postCount * 2;
        const ageA = (Date.now() - a.createdAt) / 3600000;
        const ageB = (Date.now() - b.createdAt) / 3600000;
        return (
          scoreB * Math.pow(0.95, ageB / 24) -
          scoreA * Math.pow(0.95, ageA / 24)
        );
      });
    } else if (sortBy === "controversial") {
      sorted.sort((a, b) => {
        return calculateControversy(b) - calculateControversy(a);
      });
    }
    // "new" is already sorted desc by creation time

    const result = sorted.slice(0, limit);

    // Enrich with author + category + tags + flair
    const enriched = await Promise.all(
      result.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const authorProfile = author
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", author._id))
              .first()
          : null;
        const category = await ctx.db.get(thread.categoryId);

        // Phase 10: Fetch thread tags
        const threadTagJunctions = await ctx.db
          .query("forumThreadTags")
          .withIndex("by_thread", (q) => q.eq("threadId", thread._id))
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
          const flairDoc = await ctx.db.get(thread.flairId) as Doc<"postFlairs"> | null;
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
          _id: thread._id,
          title: thread.title,
          slug: thread.slug,
          body: thread.body ?? null,
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
          // Phase 10: Tags & Flair
          tags,
          flair,
        };
      })
    );

    return {
      discussions: enriched,
      hasMore: threads.length > limit,
      nextCursor: enriched.length > 0 ? enriched[enriched.length - 1]?._id ?? null : null,
    };
  },
});

/**
 * Get leaderboard — top users by points
 *
 * Uses indexed queries on userPoints table.
 *
 * @param limit - Max entries
 * @param period - "weekly" | "monthly" | "allTime"
 * @returns Ranked leaderboard entries with user info
 */
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

    let entries;
    if (period === "weekly") {
      entries = await ctx.db
        .query("userPoints")
        .withIndex("by_weekly_points")
        .order("desc")
        .take(limit);
    } else if (period === "allTime") {
      entries = await ctx.db
        .query("userPoints")
        .withIndex("by_total_points")
        .order("desc")
        .take(limit);
    } else {
      // monthly — no dedicated index, fetch and sort
      const all = await ctx.db
        .query("userPoints")
        .order("desc")
        .take(limit * 3);
      all.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
      entries = all.slice(0, limit);
    }

    // Enrich with user data
    const leaderboard = await Promise.all(
      entries.map(async (entry, index) => {
        const user = await ctx.db.get(entry.userId);
        const profile = user
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first()
          : null;

        const rank = index + 1;
        const badge: "gold" | "silver" | "bronze" =
          rank <= 3 ? "gold" : rank <= 6 ? "silver" : "bronze";
        const points =
          period === "weekly"
            ? entry.weeklyPoints
            : period === "monthly"
              ? entry.monthlyPoints
              : entry.totalPoints;

        return {
          rank,
          badge,
          points,
          user: user
            ? {
                id: user._id,
                name:
                  profile?.displayName ?? user.name ?? "Anonymous",
                username: profile?.username ?? user._id,
                avatarUrl: profile?.avatarUrl ?? null,
              }
            : null,
        };
      })
    );

    return leaderboard.filter((e) => e.user !== null);
  },
});

/**
 * Get community stats — aggregate counts
 *
 * Uses denormalized counts from forumCategories to avoid scanning posts table.
 *
 * @returns Formatted community statistics
 */
export const getCommunityStats = query({
  args: {},
  handler: async (ctx) => {
    // Count user profiles (bounded)
    const profiles = await ctx.db.query("userProfiles").take(100000);
    const memberCount = profiles.length;

    // Count non-deleted threads (bounded)
    const threads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(100000);
    const threadCount = threads.length;

    // Sum post counts from categories (denormalized)
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

/**
 * Get trending topics — most active recent threads
 *
 * Scores recent threads by engagement and recency.
 *
 * @param limit - Max results (default 5)
 * @returns Trending topics with category and trend indicator
 */
export const getTrendingTopics = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    // Get recent threads (scan 50 most recent)
    const recentThreads = await ctx.db
      .query("forumThreads")
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(50);

    // Score by engagement × recency
    const scored = recentThreads.map((thread) => {
      const upvotes = thread.upvoteCount ?? 0;
      const posts = thread.postCount;
      const views = thread.viewCount;
      const ageHours = (Date.now() - thread.createdAt) / 3600000;
      const score =
        (upvotes * 3 + posts * 2 + views * 0.1) *
        Math.pow(0.95, ageHours / 24);
      return { thread, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topThreads = scored.slice(0, limit);

    // Enrich with category info
    const trending = await Promise.all(
      topThreads.map(async ({ thread, score }) => {
        const category = await ctx.db.get(thread.categoryId);
        return {
          id: thread._id,
          title: thread.title,
          category: category?.name ?? "General",
          posts: thread.postCount,
          trend: (score > 50 ? "hot" : "rising") as "hot" | "rising",
        };
      })
    );

    return trending;
  },
});

/**
 * Get the currently active campaign
 *
 * Uses the by_active index for O(1) lookup.
 *
 * @returns Active campaign data or null
 */
export const getActiveCampaign = query({
  args: {},
  handler: async (ctx) => {
    const campaign = await ctx.db
      .query("forumCampaigns")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();

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

/**
 * Toggle a reaction (upvote/downvote/bookmark) on a thread, post, or comment
 *
 * Maintains denormalized upvoteCount, downvoteCount, and score on threads.
 * Switching between upvote ↔ downvote removes the old reaction and adds the new one.
 *
 * @param targetType - "thread" | "post" | "comment"
 * @param targetId - ID of the target document
 * @param reactionType - "upvote" | "downvote" | "bookmark"
 * @returns { action: "added" | "removed" | "switched" }
 */
export const toggleReaction = mutation({
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Check existing reaction (upvote/downvote are mutually exclusive per target)
    const existing = await ctx.db
      .query("forumReactions")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", userId)
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
      )
      .first();

    // Deltas for denormalized counts
    let deltaUp = 0;
    let deltaDown = 0;
    let deltaBookmark = 0;
    let action: "added" | "removed" | "switched";

    if (existing && existing.reactionType === args.reactionType) {
      // Toggle off — remove same reaction
      await ctx.db.delete(existing._id);
      if (args.reactionType === "upvote") deltaUp = -1;
      else if (args.reactionType === "downvote") deltaDown = -1;
      else if (args.reactionType === "bookmark") deltaBookmark = -1;
      action = "removed";
    } else if (existing) {
      // Different reaction type — remove old, add new (switch)
      const oldType = existing.reactionType;
      await ctx.db.delete(existing._id);
      if (oldType === "upvote") deltaUp = -1;
      else if (oldType === "downvote") deltaDown = -1;
      else if (oldType === "bookmark") deltaBookmark = -1;

      await ctx.db.insert("forumReactions", {
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
      // No existing reaction — add new
      await ctx.db.insert("forumReactions", {
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
    if (args.targetType === "thread" && (deltaUp !== 0 || deltaDown !== 0 || deltaBookmark !== 0)) {
      const thread = await ctx.db.get(args.targetId as never) as Doc<"forumThreads"> | null;
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
          patchData.bookmarkCount = Math.max(0, (thread.bookmarkCount ?? 0) + deltaBookmark);
        }
        await ctx.db.patch(args.targetId as never, patchData as never);

        // --- Notification: Upvote milestone ---
        if (deltaUp > 0 && isUpvoteMilestone(newUp)) {
          const upvoteActorProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();
          const upvoteActorName =
            upvoteActorProfile?.displayName ?? "Someone";

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

/**
 * Get the current user's reactions for a set of targets
 *
 * Returns a map of targetId → reactionType for the authenticated user.
 *
 * @param targetType - "thread" | "post" | "comment"
 * @param targetIds - Array of target IDs to check
 * @returns Record<targetId, reactionType>
 */
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
      const reaction = await ctx.db
        .query("forumReactions")
        .withIndex("by_user_target", (q) =>
          q
            .eq("userId", userId)
            .eq("targetType", args.targetType)
            .eq("targetId", targetId)
        )
        .first();
      if (reaction) {
        reactions[targetId] = reaction.reactionType;
      }
    }

    return reactions;
  },
});

/**
 * Get a public user profile by username
 *
 * @param username - Username to look up
 * @returns User profile with stats
 */
export const getUserProfile = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!profile) return null;

    const user = await ctx.db.get(profile.userId);

    // Get thread count
    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_author", (q) => q.eq("authorId", profile.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(10000);

    // Get post count
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_author", (q) => q.eq("authorId", profile.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(10000);

    // Get points
    const points = await ctx.db
      .query("userPoints")
      .withIndex("by_user", (q) => q.eq("userId", profile.userId))
      .first();

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

/**
 * Get a forum category by slug
 *
 * @param slug - Category slug
 * @returns Category data or null
 */
export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!category || !category.isActive) return null;

    return {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "💬",
      color: category.color ?? null,
      threadCount: category.threadCount,
      postCount: category.postCount,
    };
  },
});

/**
 * List threads in a category by slug
 *
 * Accepts a slug instead of a category ID for convenience in URL-based lookups.
 *
 * @param slug - Category slug
 * @param limit - Max threads
 * @param sort - "recent" | "popular" | "unanswered"
 * @returns Category + threads + hasMore flag
 */
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
    const category = await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!category || !category.isActive) return null;

    const limit = args.limit ?? 20;

    let threads: Doc<"forumThreads">[];
    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as never);
      if (cursorDoc) {
        const cursorCreatedAt = (cursorDoc as { createdAt: number }).createdAt;
        threads = await ctx.db
          .query("forumThreads")
          .withIndex("by_category", (q) =>
            q.eq("categoryId", category._id)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("isDeleted"), false),
              q.lt(q.field("createdAt"), cursorCreatedAt)
            )
          )
          .order("desc")
          .take(limit + 1);
      } else {
        threads = [];
      }
    } else {
      threads = await ctx.db
        .query("forumThreads")
        .withIndex("by_category", (q) =>
          q.eq("categoryId", category._id)
        )
        .filter((q) => q.eq(q.field("isDeleted"), false))
        .order("desc")
        .take(limit + 1);
    }

    const hasMore = threads.length > limit;
    const result = hasMore ? threads.slice(0, limit) : threads;

    // Sort if needed
    if (args.sort === "popular") {
      result.sort(
        (a, b) => (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0)
      );
    }

    // Enrich with author info + tags + flair
    const enriched = await Promise.all(
      result.map(async (thread) => {
        const author = await ctx.db.get(thread.authorId);
        const profile = author
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) =>
                q.eq("userId", author._id)
              )
              .first()
          : null;

        // Phase 10: Fetch thread tags
        const threadTagJunctions = await ctx.db
          .query("forumThreadTags")
          .withIndex("by_thread", (q) => q.eq("threadId", thread._id))
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
          const flairDoc = await ctx.db.get(thread.flairId) as Doc<"postFlairs"> | null;
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
          ...thread,
          author: author
            ? {
                id: author._id,
                name:
                  profile?.displayName ??
                  author.name ??
                  "Anonymous",
                username: profile?.username ?? author._id,
                avatarUrl: profile?.avatarUrl ?? null,
              }
            : null,
          // Phase 10: Tags & Flair
          tags,
          flair,
        };
      })
    );

    return {
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        icon: category.icon ?? "💬",
        threadCount: category.threadCount,
      },
      threads: enriched,
      hasMore,
      nextCursor: enriched.length > 0 ? enriched[enriched.length - 1]?._id ?? null : null,
    };
  },
});

/**
 * Get threads by a specific user (by username)
 *
 * @param username - Username
 * @param limit - Max threads
 * @returns List of threads with category info
 */
export const getUserThreads = query({
  args: {
    username: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!profile) return [];

    const threads = await ctx.db
      .query("forumThreads")
      .withIndex("by_author", (q) =>
        q.eq("authorId", profile.userId)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    // Enrich with category
    return Promise.all(
      threads.map(async (thread) => {
        const category = await ctx.db.get(thread.categoryId);
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
