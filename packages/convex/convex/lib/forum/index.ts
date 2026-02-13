/**
 * Forum Domain — Barrel Export
 *
 * Re-exports the public API of the forum domain modules.
 */

// Types
export type {
  ForumCategoryTreeNode,
  CommentTreeNode,
  ThreadSortBy,
  EnrichedThread,
  ThreadTagInfo,
  ThreadFlairInfo,
} from "./forum.types";

// Repository (DB access)
export {
  getCategoryById,
  getCategoryBySlug,
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
  getActiveCampaign,
  getProfileByUsername,
  getProfileByUserId,
  insertThread,
  patchThread,
  insertPost,
  patchPost,
  insertComment,
  patchComment,
  insertReaction,
  deleteReaction,
  patchCategory,
} from "./forum.repository";

// Policies
export {
  canEditThread,
  canDeleteThread,
  canEditPost,
  canDeletePost,
  canDeleteComment,
} from "./forum.policies";

// Service (business logic)
export {
  generateThreadSlug,
  validateThreadTitle,
  validatePostContent,
  validateCommentContent,
  validatePostTypeFields,
  extractLinkDomain,
  calculateControversy,
  scoreForTrending,
  sortThreads,
  formatCount,
} from "./forum.service";

// Mappers (response shaping)
export {
  toThreadListItem,
  toThreadDetail,
  toCommentTree,
  toCategoryTree,
  toLeaderboardEntry,
  toTagInfo,
  toFlairInfo,
} from "./forum.mappers";
