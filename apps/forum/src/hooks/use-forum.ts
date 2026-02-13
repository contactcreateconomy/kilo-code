"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import type { QueryEnvelope, MutationEnvelope } from "@createconomy/ui/types/envelope";
import {
  forumCategoryQueryArgs,
  forumPostCommentsQueryArgs,
  forumThreadQueryArgs,
  forumThreadsQueryArgs,
} from "./forum-id-helpers";
import { useThreadMutations } from "./use-thread-mutations";
import { usePostMutations } from "./use-post-mutations";

type ForumCategoriesData = FunctionReturnType<
  typeof api.functions.forum.listForumCategories
>;
type ForumCategoryData = FunctionReturnType<
  typeof api.functions.forum.getForumCategory
>;
type ForumThreadsData = FunctionReturnType<typeof api.functions.forum.listThreads>;
type ForumThreadData = FunctionReturnType<typeof api.functions.forum.getThread>;
type ForumPostCommentsData = FunctionReturnType<
  typeof api.functions.forum.getPostComments
>;
type ForumSearchThreadsData = FunctionReturnType<
  typeof api.functions.forum.searchThreads
>;

type CreateThreadInput = {
  title: string;
  content: string;
  categoryId: string;
};

type UpdateThreadInput = {
  title?: string;
  isPinned?: boolean;
  isLocked?: boolean;
};

type ForumMutationHandlers = {
  createThread: (data: CreateThreadInput) => Promise<Id<"forumThreads">>;
  updateThread: (threadId: string, data: UpdateThreadInput) => Promise<boolean>;
  deleteThread: (threadId: string) => Promise<boolean>;
  viewThread: (threadId: string) => Promise<null>;
  createPost: (data: { threadId: string; content: string }) => Promise<Id<"forumPosts">>;
  updatePost: (postId: string, content: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
};

type UseForumResult = MutationEnvelope<ForumMutationHandlers> & ForumMutationHandlers;

type UseCategoriesResult = QueryEnvelope<ForumCategoriesData> & {
  categories: ForumCategoriesData;
};

type UseCategoryResult = QueryEnvelope<ForumCategoryData | null> & {
  category: ForumCategoryData | null;
};

type UseThreadsResult = QueryEnvelope<ForumThreadsData> & {
  threads: ForumThreadsData["threads"];
  pinnedThreads: ForumThreadsData["pinned"];
  hasMore: boolean;
};

type UseThreadResult = QueryEnvelope<ForumThreadData | null> & {
  thread: ForumThreadData | null;
};

type UsePostCommentsResult = QueryEnvelope<ForumPostCommentsData> & {
  comments: ForumPostCommentsData;
};

type UseSearchThreadsResult = QueryEnvelope<ForumSearchThreadsData> & {
  results: ForumSearchThreadsData;
};

/**
 * Hook for forum mutations (create, update, delete threads and posts).
 *
 * @deprecated Prefer `useThreadMutations()` and `usePostMutations()` for
 * better Interface Segregation. This hook remains for backward compatibility
 * and composes both hooks internally.
 */
export function useForum(): UseForumResult {
  const threadMutations = useThreadMutations();
  const postMutations = usePostMutations();

  const data: ForumMutationHandlers = {
    createThread: threadMutations.createThread,
    updateThread: threadMutations.updateThread,
    deleteThread: threadMutations.deleteThread,
    viewThread: threadMutations.viewThread,
    createPost: postMutations.createPost,
    updatePost: postMutations.updatePost,
    deletePost: postMutations.deletePost,
  };

  return {
    ...data,
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook to get categories
 */
export function useCategories(): UseCategoriesResult {
  const categories = useQuery(api.functions.forum.listForumCategories, {});
  const data = categories ?? [];

  return {
    categories: data,
    data,
    isLoading: categories === undefined,
    error: null,
  };
}

/**
 * Hook to get a single category by ID
 */
export function useCategory(categoryId: string | undefined): UseCategoryResult {
  const category = useQuery(api.functions.forum.getForumCategory, forumCategoryQueryArgs(categoryId));
  const data = category ?? null;

  return {
    category: data,
    data,
    isLoading: !!categoryId && category === undefined,
    error: null,
  };
}

/**
 * Hook to get threads in a category
 */
export function useThreads(categoryId: string | undefined): UseThreadsResult {
  const result = useQuery(api.functions.forum.listThreads, forumThreadsQueryArgs(categoryId));
  const data: ForumThreadsData = result ?? { pinned: [], threads: [], hasMore: false, nextCursor: null };

  return {
    threads: data.threads,
    pinnedThreads: data.pinned,
    hasMore: data.hasMore,
    data,
    isLoading: !!categoryId && result === undefined,
    error: null,
  };
}

/**
 * Hook to get a single thread
 */
export function useThread(threadId: string | undefined): UseThreadResult {
  const thread = useQuery(api.functions.forum.getThread, forumThreadQueryArgs(threadId));
  const data = thread ?? null;

  return {
    thread: data,
    data,
    isLoading: !!threadId && thread === undefined,
    error: null,
  };
}

/**
 * Hook to get comments for a post
 */
export function usePostComments(postId: string | undefined): UsePostCommentsResult {
  const comments = useQuery(api.functions.forum.getPostComments, forumPostCommentsQueryArgs(postId));
  const data = comments ?? [];

  return {
    comments: data,
    data,
    isLoading: !!postId && comments === undefined,
    error: null,
  };
}

/**
 * Hook to search threads
 */
export function useSearchThreads(query: string): UseSearchThreadsResult {
  const results = useQuery(api.functions.forum.searchThreads, query ? { query } : "skip");
  const data = results ?? [];

  return {
    results: data,
    data,
    isLoading: results === undefined,
    error: null,
  };
}
