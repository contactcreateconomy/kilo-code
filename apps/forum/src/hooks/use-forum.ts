"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";

/**
 * Hook for forum mutations (create, update, delete threads and posts)
 */
export function useForum() {
  // Mutations
  const createThread = useMutation(api.functions.forum.createThread);
  const updateThread = useMutation(api.functions.forum.updateThread);
  const deleteThread = useMutation(api.functions.forum.deleteThread);
  const createPost = useMutation(api.functions.forum.createPost);
  const updatePost = useMutation(api.functions.forum.updatePost);
  const deletePost = useMutation(api.functions.forum.deletePost);
  const incrementViewCount = useMutation(api.functions.forum.incrementThreadViewCount);

  // Create a new thread
  const handleCreateThread = useCallback(
    async (data: {
      title: string;
      content: string;
      categoryId: string;
    }) => {
      // categoryId must be a valid Id<"forumCategories"> at runtime
      return await createThread({
        title: data.title,
        content: data.content,
        categoryId: data.categoryId as never,
      });
    },
    [createThread]
  );

  // Update a thread
  const handleUpdateThread = useCallback(
    async (
      threadId: string,
      data: {
        title?: string;
        isPinned?: boolean;
        isLocked?: boolean;
      }
    ) => {
      return await updateThread({ threadId: threadId as never, ...data });
    },
    [updateThread]
  );

  // Delete a thread
  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      return await deleteThread({ threadId: threadId as never });
    },
    [deleteThread]
  );

  // Create a post/reply
  const handleCreatePost = useCallback(
    async (data: { threadId: string; content: string }) => {
      return await createPost({
        threadId: data.threadId as never,
        content: data.content,
      });
    },
    [createPost]
  );

  // Update a post
  const handleUpdatePost = useCallback(
    async (postId: string, content: string) => {
      return await updatePost({ postId: postId as never, content });
    },
    [updatePost]
  );

  // Delete a post
  const handleDeletePost = useCallback(
    async (postId: string) => {
      return await deletePost({ postId: postId as never });
    },
    [deletePost]
  );

  // Track thread view
  const handleViewThread = useCallback(
    async (threadId: string) => {
      return await incrementViewCount({ threadId: threadId as never });
    },
    [incrementViewCount]
  );

  return {
    // Thread operations
    createThread: handleCreateThread,
    updateThread: handleUpdateThread,
    deleteThread: handleDeleteThread,
    viewThread: handleViewThread,

    // Post operations
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
  };
}

/**
 * Hook to get categories
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCategories(): { categories: any[]; isLoading: boolean } {
  const categories = useQuery(api.functions.forum.listForumCategories, {});
  return {
    categories: (categories ?? []) as unknown[],
    isLoading: categories === undefined,
  };
}

/**
 * Hook to get a single category by ID
 */
export function useCategory(categoryId: string | undefined) {
  const category = useQuery(
    api.functions.forum.getForumCategory,
    categoryId ? { categoryId: categoryId as never } : "skip"
  );
  return {
    category: category ?? null,
    isLoading: category === undefined,
  };
}

/**
 * Hook to get threads in a category
 */
export function useThreads(categoryId: string | undefined) {
  const result = useQuery(
    api.functions.forum.listThreads,
    categoryId ? { categoryId: categoryId as never } : "skip"
  );
  return {
    threads: result?.threads ?? [],
    pinnedThreads: result?.pinned ?? [],
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}

/**
 * Hook to get a single thread
 */
export function useThread(threadId: string | undefined) {
  const thread = useQuery(
    api.functions.forum.getThread,
    threadId ? { threadId: threadId as never } : "skip"
  );
  return {
    thread: thread ?? null,
    isLoading: thread === undefined,
  };
}

/**
 * Hook to get comments for a post
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePostComments(postId: string | undefined): { comments: any[]; isLoading: boolean } {
  const comments = useQuery(
    api.functions.forum.getPostComments,
    postId ? { postId: postId as never } : "skip"
  );
  return {
    comments: (comments ?? []) as unknown[],
    isLoading: comments === undefined,
  };
}

/**
 * Hook to search threads
 */
export function useSearchThreads(query: string) {
  const results = useQuery(
    api.functions.forum.searchThreads,
    query ? { query } : "skip"
  );

  return {
    results: results ?? [],
    isLoading: results === undefined,
  };
}
