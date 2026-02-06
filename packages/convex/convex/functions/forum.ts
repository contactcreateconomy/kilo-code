import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "../_generated/dataModel";

/**
 * Forum Management Functions
 *
 * Queries and mutations for managing forum categories, threads, posts, and comments
 * in the Createconomy community forum.
 */

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

    interface ForumCategoryTreeNode extends Doc<"forumCategories"> {
      children?: ForumCategoryTreeNode[];
    }

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
    interface CommentTreeNode extends CommentWithAuthor {
      replies?: CommentTreeNode[];
    }

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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

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

    // Validate content
    if (args.content.length < 10) {
      throw new Error("Content must be at least 10 characters");
    }

    const now = Date.now();

    // Generate slug
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 100) + `-${now}`;

    // Create thread
    const threadId = await ctx.db.insert("forumThreads", {
      tenantId: args.tenantId ?? category.tenantId,
      categoryId: args.categoryId,
      authorId: userId,
      title: args.title,
      slug,
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      postCount: 1,
      lastPostAt: now,
      lastPostUserId: userId,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create first post
    await ctx.db.insert("forumPosts", {
      tenantId: args.tenantId ?? category.tenantId,
      threadId,
      authorId: userId,
      content: args.content,
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
