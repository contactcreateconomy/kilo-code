/**
 * Forum Domain Mappers
 *
 * Response-shaping functions that transform raw DB documents into
 * the shapes returned by Convex query/mutation handlers.
 *
 * These are pure (no DB access) — they take already-fetched data
 * and reshape it for the client.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { AuthorInfo } from "../shared/author";
import type {
  ForumCategoryTreeNode,
  CommentTreeNode,
  EnrichedThread,
  ThreadTagInfo,
  ThreadFlairInfo,
} from "./forum.types";

// ---------------------------------------------------------------------------
// Thread list item
// ---------------------------------------------------------------------------

export function toThreadListItem(
  thread: Doc<"forumThreads">,
  author: AuthorInfo | null,
  category: Doc<"forumCategories"> | null,
  tags: ThreadTagInfo[],
  flair: ThreadFlairInfo | null
): EnrichedThread {
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
    author,
    category: category
      ? {
          id: category._id,
          name: category.name,
          slug: category.slug,
          icon: category.icon ?? null,
          color: category.color ?? null,
        }
      : null,
    tags,
    flair,
  };
}

// ---------------------------------------------------------------------------
// Thread detail (for getThread)
// ---------------------------------------------------------------------------

export function toThreadDetail(
  thread: Doc<"forumThreads">,
  author: AuthorInfo | null,
  category: Doc<"forumCategories"> | null,
  posts: Array<
    Doc<"forumPosts"> & { author: AuthorInfo | null; commentCount: number }
  >
) {
  return {
    ...thread,
    author,
    category: category
      ? {
          id: category._id,
          name: category.name,
          slug: category.slug,
        }
      : null,
    posts,
  };
}

// ---------------------------------------------------------------------------
// Comment tree
// ---------------------------------------------------------------------------

export function toCommentTree(
  comments: Array<Doc<"forumComments"> & { author: AuthorInfo | null }>
): CommentTreeNode[] {
  const rootComments = comments.filter((c) => !c.parentId);
  const childComments = comments.filter((c) => c.parentId);

  const buildTree = (
    parent: (typeof comments)[0]
  ): CommentTreeNode => {
    const children = childComments
      .filter((c) => c.parentId === parent._id)
      .map((child) => buildTree(child));

    return {
      ...parent,
      replies: children.length > 0 ? children : undefined,
    };
  };

  return rootComments.map(buildTree);
}

// ---------------------------------------------------------------------------
// Category tree
// ---------------------------------------------------------------------------

export function toCategoryTree(
  categories: Doc<"forumCategories">[]
): ForumCategoryTreeNode[] {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const rootCategories = sorted.filter((c) => !c.parentId);
  const childCategories = sorted.filter((c) => c.parentId);

  function buildTree(
    parent: Doc<"forumCategories">
  ): ForumCategoryTreeNode {
    const children: ForumCategoryTreeNode[] = childCategories
      .filter((c) => c.parentId === parent._id)
      .map((child) => buildTree(child));

    return {
      ...parent,
      children: children.length > 0 ? children : undefined,
    };
  }

  return rootCategories.map(buildTree);
}

// ---------------------------------------------------------------------------
// Leaderboard entry
// ---------------------------------------------------------------------------

export function toLeaderboardEntry(
  entry: Doc<"userPoints">,
  user: AuthorInfo | null,
  rank: number,
  period: "weekly" | "monthly" | "allTime"
) {
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
    user,
  };
}

// ---------------------------------------------------------------------------
// Tag & flair extraction helpers
// ---------------------------------------------------------------------------

export function toTagInfo(tag: Doc<"forumTags">): ThreadTagInfo {
  return {
    _id: tag._id,
    name: tag.name,
    displayName: tag.displayName,
    color: tag.color ?? null,
  };
}

export function toFlairInfo(
  flair: Doc<"postFlairs">
): ThreadFlairInfo | null {
  if (!flair.isActive) return null;
  return {
    _id: flair._id,
    displayName: flair.displayName,
    backgroundColor: flair.backgroundColor,
    textColor: flair.textColor,
    emoji: flair.emoji ?? null,
  };
}
