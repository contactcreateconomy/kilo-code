import type { Id } from "@createconomy/convex/dataModel";

export function toForumCategoryId(categoryId: string): Id<"forumCategories"> {
  return categoryId as Id<"forumCategories">;
}

export function toForumThreadId(threadId: string): Id<"forumThreads"> {
  return threadId as Id<"forumThreads">;
}

export function toForumPostId(postId: string): Id<"forumPosts"> {
  return postId as Id<"forumPosts">;
}

export function toPostFlairId(flairId: string): Id<"postFlairs"> {
  return flairId as Id<"postFlairs">;
}

export function toForumTagId(tagId: string): Id<"forumTags"> {
  return tagId as Id<"forumTags">;
}

export function toUserId(userId: string | Id<"users">): Id<"users"> {
  return userId as Id<"users">;
}

export function toNotificationId(
  notificationId: string
): Id<"notifications"> {
  return notificationId as Id<"notifications">;
}

export function toCommentId(commentId: string): Id<"comments"> {
  return commentId as Id<"comments">;
}

export function forumCategoryQueryArgs(
  categoryId: string | undefined
): "skip" | { categoryId: Id<"forumCategories"> } {
  return categoryId ? { categoryId: toForumCategoryId(categoryId) } : "skip";
}

export function forumThreadsQueryArgs(
  categoryId: string | undefined
): "skip" | { categoryId: Id<"forumCategories"> } {
  return categoryId ? { categoryId: toForumCategoryId(categoryId) } : "skip";
}

export function forumThreadQueryArgs(
  threadId: string | undefined
): "skip" | { threadId: Id<"forumThreads"> } {
  return threadId ? { threadId: toForumThreadId(threadId) } : "skip";
}

export function forumPostCommentsQueryArgs(
  postId: string | undefined
): "skip" | { postId: Id<"forumPosts"> } {
  return postId ? { postId: toForumPostId(postId) } : "skip";
}

export function flairQueryArgs(
  flairId: string | undefined
): "skip" | { flairId: Id<"postFlairs"> } {
  return flairId ? { flairId: toPostFlairId(flairId) } : "skip";
}

export function followUserQueryArgs(
  userId: Id<"users"> | string | undefined
): "skip" | { userId: Id<"users"> } {
  return userId ? { userId: toUserId(userId) } : "skip";
}
