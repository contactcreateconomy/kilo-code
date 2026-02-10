import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";
import { SLUG_PATTERN } from "../lib/constants";

/**
 * Seller Posts / Blog Functions
 *
 * CRUD for seller blog posts / updates.
 * Gumroad equivalent: Seller posts / updates feature on profile pages.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get published posts by a seller (public view).
 */
export const getSellerPosts = query({
  args: {
    sellerId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const posts = await ctx.db
      .query("sellerPosts")
      .withIndex("by_seller_published", (q) =>
        q.eq("sellerId", args.sellerId).eq("isPublished", true)
      )
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    return { items: posts };
  },
});

/**
 * Get all posts by the current seller (including drafts, seller view).
 */
export const getMyPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const posts = await ctx.db
      .query("sellerPosts")
      .withIndex("by_seller", (q) => q.eq("sellerId", userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    return { items: posts };
  },
});

/**
 * Get a single post by slug (public view).
 */
export const getPostBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("sellerPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!post || post.isDeleted) {
      return null;
    }

    // Get seller info
    const seller = await ctx.db.get(post.sellerId);
    const sellerProfile = seller
      ? await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", seller._id))
          .first()
      : null;

    return {
      ...post,
      seller: seller
        ? {
            _id: seller._id,
            name: seller.name,
            displayName: sellerProfile?.displayName,
            avatarUrl: sellerProfile?.avatarUrl,
          }
        : null,
    };
  },
});

/**
 * Get a single post by ID.
 */
export const getPost = query({
  args: {
    postId: v.id("sellerPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      return null;
    }
    return post;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a seller post (seller only).
 */
export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    // Verify seller role
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.defaultRole !== "seller" && profile.defaultRole !== "admin")) {
      throw createError(ErrorCode.UNAUTHORIZED, "Seller role required");
    }

    // Validate slug
    if (!SLUG_PATTERN.test(args.slug)) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        "Slug must be lowercase alphanumeric characters separated by hyphens"
      );
    }

    // Check slug uniqueness
    const existingSlug = await ctx.db
      .query("sellerPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug && !existingSlug.isDeleted) {
      throw createError(
        ErrorCode.ALREADY_EXISTS,
        `A post with slug "${args.slug}" already exists`
      );
    }

    const now = Date.now();
    const isPublished = args.isPublished ?? false;

    const postId = await ctx.db.insert("sellerPosts", {
      sellerId: userId,
      tenantId: args.tenantId,
      title: args.title,
      slug: args.slug,
      content: args.content,
      excerpt: args.excerpt,
      coverImageUrl: args.coverImageUrl,
      isPublished,
      publishedAt: isPublished ? now : undefined,
      viewCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

/**
 * Update a seller post (seller only, own posts).
 */
export const updatePost = mutation({
  args: {
    postId: v.id("sellerPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Post not found");
    }

    if (post.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    // Validate slug if changed
    if (args.slug && args.slug !== post.slug) {
      if (!SLUG_PATTERN.test(args.slug)) {
        throw createError(
          ErrorCode.INVALID_INPUT,
          "Slug must be lowercase alphanumeric characters separated by hyphens"
        );
      }

      const existingSlug = await ctx.db
        .query("sellerPosts")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
        .first();

      if (existingSlug && existingSlug._id !== args.postId && !existingSlug.isDeleted) {
        throw createError(
          ErrorCode.ALREADY_EXISTS,
          `A post with slug "${args.slug}" already exists`
        );
      }
    }

    const { postId: _postId, ...updates } = args;

    // Set publishedAt if publishing for the first time
    const isPublishing = args.isPublished === true && !post.isPublished;

    await ctx.db.patch(args.postId, {
      ...updates,
      ...(isPublishing ? { publishedAt: Date.now() } : {}),
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete a seller post (soft delete, seller only).
 */
export const deletePost = mutation({
  args: {
    postId: v.id("sellerPosts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Post not found");
    }

    if (post.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    await ctx.db.patch(args.postId, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Increment post view count.
 */
export const incrementPostViewCount = mutation({
  args: {
    postId: v.id("sellerPosts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post || post.isDeleted) {
      return;
    }

    await ctx.db.patch(args.postId, {
      viewCount: post.viewCount + 1,
    });
  },
});
