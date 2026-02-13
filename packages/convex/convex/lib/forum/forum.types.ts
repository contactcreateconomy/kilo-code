/**
 * Forum Domain Types
 *
 * Central type definitions for the forum domain.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { AuthorInfo } from "../shared/author";

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

/** Category tree node for nested category display. */
export interface ForumCategoryTreeNode extends Doc<"forumCategories"> {
  children?: ForumCategoryTreeNode[];
}

/** Nested comment with author info and recursive replies. */
export interface CommentTreeNode {
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
  author: AuthorInfo | null;
  replies?: CommentTreeNode[];
}

/** Sorting options for thread listings. */
export type ThreadSortBy = "top" | "hot" | "new" | "controversial";

/** Tag summary attached to thread listings. */
export interface ThreadTagInfo {
  _id: Id<"forumTags">;
  name: string;
  displayName: string;
  color: string | null;
}

/** Flair summary attached to thread listings. */
export interface ThreadFlairInfo {
  _id: Id<"postFlairs">;
  displayName: string;
  backgroundColor: string;
  textColor: string;
  emoji: string | null;
}

/** Enriched thread for feed/list display. */
export interface EnrichedThread {
  _id: Id<"forumThreads">;
  title: string;
  slug: string;
  body: string | null;
  aiSummary?: string | null;
  imageUrl?: string | null;
  postType: string;
  linkUrl?: string | null;
  linkDomain?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkImage?: string | null;
  images?: Array<{
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }> | null;
  pollOptions?: string[] | null;
  pollEndsAt?: number | null;
  isPinned: boolean;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  commentCount: number;
  postCount: number;
  viewCount: number;
  createdAt: number;
  author: AuthorInfo | null;
  category: {
    id: Id<"forumCategories">;
    name: string;
    slug: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  tags: ThreadTagInfo[];
  flair: ThreadFlairInfo | null;
}
