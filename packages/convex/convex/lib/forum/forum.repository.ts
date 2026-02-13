/**
 * Forum Repository
 *
 * Database access patterns for the forum domain.
 * Every function receives a Convex context so it executes inside
 * Convex's transactional runtime.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";

type ReadCtx = Pick<QueryCtx, "db">;
type WriteCtx = Pick<MutationCtx, "db">;

// ---------------------------------------------------------------------------
// Category reads
// ---------------------------------------------------------------------------

export async function getCategoryById(
  ctx: ReadCtx,
  categoryId: Id<"forumCategories">
): Promise<Doc<"forumCategories"> | null> {
  return await ctx.db.get(categoryId);
}

export async function getCategoryBySlug(
  ctx: ReadCtx,
  slug: string
): Promise<Doc<"forumCategories"> | null> {
  return await ctx.db
    .query("forumCategories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

export async function listActiveCategories(
  ctx: ReadCtx,
  tenantId?: Id<"tenants">
): Promise<Doc<"forumCategories">[]> {
  let q;
  if (tenantId) {
    q = ctx.db
      .query("forumCategories")
      .withIndex("by_tenant", (qi) => qi.eq("tenantId", tenantId));
  } else {
    q = ctx.db.query("forumCategories");
  }
  return await q
    .filter((qi) => qi.eq(qi.field("isActive"), true))
    .collect();
}

// ---------------------------------------------------------------------------
// Thread reads
// ---------------------------------------------------------------------------

export async function getThreadById(
  ctx: ReadCtx,
  threadId: Id<"forumThreads">
): Promise<Doc<"forumThreads"> | null> {
  return await ctx.db.get(threadId);
}

export async function getThreadsByCategory(
  ctx: ReadCtx,
  categoryId: Id<"forumCategories">,
  opts: { limit: number; pinned?: boolean }
): Promise<Doc<"forumThreads">[]> {
  let q = ctx.db
    .query("forumThreads")
    .withIndex("by_category", (qi) => qi.eq("categoryId", categoryId));

  if (opts.pinned !== undefined) {
    q = q.filter((qi) =>
      qi.and(
        qi.eq(qi.field("isDeleted"), false),
        qi.eq(qi.field("isPinned"), opts.pinned!)
      )
    );
  } else {
    q = q.filter((qi) => qi.eq(qi.field("isDeleted"), false));
  }

  return await q.order("desc").take(opts.limit);
}

export async function getThreadsByAuthor(
  ctx: ReadCtx,
  authorId: Id<"users">,
  limit: number
): Promise<Doc<"forumThreads">[]> {
  return await ctx.db
    .query("forumThreads")
    .withIndex("by_author", (q) => q.eq("authorId", authorId))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .order("desc")
    .take(limit);
}

export async function getRecentThreads(
  ctx: ReadCtx,
  limit: number
): Promise<Doc<"forumThreads">[]> {
  return await ctx.db
    .query("forumThreads")
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .order("desc")
    .take(limit);
}

export async function getThreadsBeforeCursor(
  ctx: ReadCtx,
  cursorCreatedAt: number,
  limit: number,
  categoryId?: Id<"forumCategories">
): Promise<Doc<"forumThreads">[]> {
  if (categoryId) {
    return await ctx.db
      .query("forumThreads")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.lt(q.field("createdAt"), cursorCreatedAt)
        )
      )
      .order("desc")
      .take(limit);
  }

  return await ctx.db
    .query("forumThreads")
    .filter((q) =>
      q.and(
        q.eq(q.field("isDeleted"), false),
        q.lt(q.field("createdAt"), cursorCreatedAt)
      )
    )
    .order("desc")
    .take(limit);
}

// ---------------------------------------------------------------------------
// Post reads
// ---------------------------------------------------------------------------

export async function getPostById(
  ctx: ReadCtx,
  postId: Id<"forumPosts">
): Promise<Doc<"forumPosts"> | null> {
  return await ctx.db.get(postId);
}

export async function getPostsByThread(
  ctx: ReadCtx,
  threadId: Id<"forumThreads">,
  limit: number
): Promise<Doc<"forumPosts">[]> {
  return await ctx.db
    .query("forumPosts")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .filter((q) =>
      q.and(
        q.eq(q.field("isDeleted"), false),
        q.eq(q.field("status"), "published")
      )
    )
    .order("asc")
    .take(limit);
}

export async function getPostsByAuthor(
  ctx: ReadCtx,
  authorId: Id<"users">,
  limit: number,
  opts?: { excludeFirstPost?: boolean }
): Promise<Doc<"forumPosts">[]> {
  let q = ctx.db
    .query("forumPosts")
    .withIndex("by_author", (q) => q.eq("authorId", authorId))
    .filter((q) => q.eq(q.field("isDeleted"), false));

  if (opts?.excludeFirstPost) {
    q = q.filter((qi) => qi.eq(qi.field("isFirstPost"), false));
  }

  return await q.order("desc").take(limit);
}

// ---------------------------------------------------------------------------
// Comment reads
// ---------------------------------------------------------------------------

export async function getCommentById(
  ctx: ReadCtx,
  commentId: Id<"forumComments">
): Promise<Doc<"forumComments"> | null> {
  return await ctx.db.get(commentId);
}

export async function getCommentsByPost(
  ctx: ReadCtx,
  postId: Id<"forumPosts">
): Promise<Doc<"forumComments">[]> {
  return await ctx.db
    .query("forumComments")
    .withIndex("by_post", (q) => q.eq("postId", postId))
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();
}

// ---------------------------------------------------------------------------
// Reaction reads
// ---------------------------------------------------------------------------

export async function getReactionByUserTarget(
  ctx: ReadCtx,
  userId: Id<"users">,
  targetType: "thread" | "post" | "comment",
  targetId: string
): Promise<Doc<"forumReactions"> | null> {
  return await ctx.db
    .query("forumReactions")
    .withIndex("by_user_target", (q) =>
      q
        .eq("userId", userId)
        .eq("targetType", targetType)
        .eq("targetId", targetId)
    )
    .first();
}

export async function getUserBookmarks(
  ctx: ReadCtx,
  userId: Id<"users">,
  limit: number
): Promise<Doc<"forumReactions">[]> {
  return await ctx.db
    .query("forumReactions")
    .withIndex("by_user_target", (q) =>
      q.eq("userId", userId).eq("targetType", "thread")
    )
    .filter((q) => q.eq(q.field("reactionType"), "bookmark"))
    .order("desc")
    .take(limit);
}

// ---------------------------------------------------------------------------
// Tag & flair reads
// ---------------------------------------------------------------------------

export async function getThreadTags(
  ctx: ReadCtx,
  threadId: Id<"forumThreads">
): Promise<Doc<"forumTags">[]> {
  const junctions = await ctx.db
    .query("forumThreadTags")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .collect();

  const tags = await Promise.all(
    junctions.map((tt) => ctx.db.get(tt.tagId))
  );
  return tags.filter(Boolean) as Doc<"forumTags">[];
}

export async function getFlairById(
  ctx: ReadCtx,
  flairId: Id<"postFlairs">
): Promise<Doc<"postFlairs"> | null> {
  return await ctx.db.get(flairId);
}

// ---------------------------------------------------------------------------
// Points & leaderboard reads
// ---------------------------------------------------------------------------

export async function getLeaderboardEntries(
  ctx: ReadCtx,
  period: "weekly" | "monthly" | "allTime",
  limit: number
): Promise<Doc<"userPoints">[]> {
  if (period === "weekly") {
    return await ctx.db
      .query("userPoints")
      .withIndex("by_weekly_points")
      .order("desc")
      .take(limit);
  }
  if (period === "allTime") {
    return await ctx.db
      .query("userPoints")
      .withIndex("by_total_points")
      .order("desc")
      .take(limit);
  }
  // monthly — no dedicated index, fetch and sort
  const all = await ctx.db
    .query("userPoints")
    .order("desc")
    .take(limit * 3);
  all.sort((a, b) => b.monthlyPoints - a.monthlyPoints);
  return all.slice(0, limit);
}

export async function getUserPoints(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<Doc<"userPoints"> | null> {
  return await ctx.db
    .query("userPoints")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// ---------------------------------------------------------------------------
// Campaign reads
// ---------------------------------------------------------------------------

export async function getActiveCampaign(
  ctx: ReadCtx
): Promise<Doc<"forumCampaigns"> | null> {
  return await ctx.db
    .query("forumCampaigns")
    .withIndex("by_active", (q) => q.eq("isActive", true))
    .first();
}

// ---------------------------------------------------------------------------
// Profile reads (forum-specific)
// ---------------------------------------------------------------------------

export async function getProfileByUsername(
  ctx: ReadCtx,
  username: string
): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_username", (q) => q.eq("username", username))
    .first();
}

export async function getProfileByUserId(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// ---------------------------------------------------------------------------
// Thread writes
// ---------------------------------------------------------------------------

export async function insertThread(
  ctx: WriteCtx,
  data: Parameters<WriteCtx["db"]["insert"]>[1] & { __table?: "forumThreads" }
): Promise<Id<"forumThreads">> {
  return await ctx.db.insert("forumThreads", data as never);
}

export async function patchThread(
  ctx: WriteCtx,
  threadId: Id<"forumThreads">,
  data: Partial<Doc<"forumThreads">>
): Promise<void> {
  await ctx.db.patch(threadId, data as never);
}

// ---------------------------------------------------------------------------
// Post writes
// ---------------------------------------------------------------------------

export async function insertPost(
  ctx: WriteCtx,
  data: Parameters<WriteCtx["db"]["insert"]>[1] & { __table?: "forumPosts" }
): Promise<Id<"forumPosts">> {
  return await ctx.db.insert("forumPosts", data as never);
}

export async function patchPost(
  ctx: WriteCtx,
  postId: Id<"forumPosts">,
  data: Partial<Doc<"forumPosts">>
): Promise<void> {
  await ctx.db.patch(postId, data as never);
}

// ---------------------------------------------------------------------------
// Comment writes
// ---------------------------------------------------------------------------

export async function insertComment(
  ctx: WriteCtx,
  data: Parameters<WriteCtx["db"]["insert"]>[1] & { __table?: "forumComments" }
): Promise<Id<"forumComments">> {
  return await ctx.db.insert("forumComments", data as never);
}

export async function patchComment(
  ctx: WriteCtx,
  commentId: Id<"forumComments">,
  data: Partial<Doc<"forumComments">>
): Promise<void> {
  await ctx.db.patch(commentId, data as never);
}

// ---------------------------------------------------------------------------
// Reaction writes
// ---------------------------------------------------------------------------

export async function insertReaction(
  ctx: WriteCtx,
  data: {
    userId: Id<"users">;
    targetType: string;
    targetId: string;
    reactionType: string;
    createdAt: number;
  }
): Promise<Id<"forumReactions">> {
  return await ctx.db.insert("forumReactions", data as never);
}

export async function deleteReaction(
  ctx: WriteCtx,
  reactionId: Id<"forumReactions">
): Promise<void> {
  await ctx.db.delete(reactionId);
}

// ---------------------------------------------------------------------------
// Category writes
// ---------------------------------------------------------------------------

export async function patchCategory(
  ctx: WriteCtx,
  categoryId: Id<"forumCategories">,
  data: Partial<Doc<"forumCategories">>
): Promise<void> {
  await ctx.db.patch(categoryId, data as never);
}
