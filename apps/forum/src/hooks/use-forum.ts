"use client";

import { useCallback } from "react";
import { useMutation, useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@createconomy/convex";

// Types
interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
  threadCount: number;
  postCount: number;
}

interface Thread {
  _id: string;
  title: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  authorId: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: number;
  updatedAt: number;
}

interface Post {
  _id: string;
  threadId: string;
  authorId: string;
  content: string;
  likeCount: number;
  createdAt: number;
  updatedAt: number;
}

export function useForum() {
  // Mutations
  const createThread = useMutation(api.functions.forum.createThread);
  const updateThread = useMutation(api.functions.forum.updateThread);
  const deleteThread = useMutation(api.functions.forum.deleteThread);
  const createPost = useMutation(api.functions.forum.createPost);
  const updatePost = useMutation(api.functions.forum.updatePost);
  const deletePost = useMutation(api.functions.forum.deletePost);
  const likePost = useMutation(api.functions.forum.likePost);
  const unlikePost = useMutation(api.functions.forum.unlikePost);
  const incrementViewCount = useMutation(api.functions.forum.incrementViewCount);

  // Create a new thread
  const handleCreateThread = useCallback(
    async (data: {
      title: string;
      content: string;
      categoryId: string;
      tags?: string[];
    }) => {
      return await createThread(data);
    },
    [createThread]
  );

  // Update a thread
  const handleUpdateThread = useCallback(
    async (
      threadId: string,
      data: {
        title?: string;
        content?: string;
        isPinned?: boolean;
        isLocked?: boolean;
      }
    ) => {
      return await updateThread({ threadId, ...data });
    },
    [updateThread]
  );

  // Delete a thread
  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      return await deleteThread({ threadId });
    },
    [deleteThread]
  );

  // Create a post/reply
  const handleCreatePost = useCallback(
    async (data: { threadId: string; content: string; replyToId?: string }) => {
      return await createPost(data);
    },
    [createPost]
  );

  // Update a post
  const handleUpdatePost = useCallback(
    async (postId: string, content: string) => {
      return await updatePost({ postId, content });
    },
    [updatePost]
  );

  // Delete a post
  const handleDeletePost = useCallback(
    async (postId: string) => {
      return await deletePost({ postId });
    },
    [deletePost]
  );

  // Like a post
  const handleLikePost = useCallback(
    async (postId: string) => {
      return await likePost({ postId });
    },
    [likePost]
  );

  // Unlike a post
  const handleUnlikePost = useCallback(
    async (postId: string) => {
      return await unlikePost({ postId });
    },
    [unlikePost]
  );

  // Track thread view
  const handleViewThread = useCallback(
    async (threadId: string) => {
      return await incrementViewCount({ threadId });
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
    likePost: handleLikePost,
    unlikePost: handleUnlikePost,
  };
}

// Hook to get categories
export function useCategories() {
  const categories = useQuery(api.functions.forum.getCategories);
  return {
    categories: categories ?? [],
    isLoading: categories === undefined,
  };
}

// Hook to get a single category
export function useCategory(slug: string) {
  const category = useQuery(api.functions.forum.getCategoryBySlug, { slug });
  return {
    category: category ?? null,
    isLoading: category === undefined,
  };
}

// Hook to get threads with pagination
export function useThreads(options?: {
  categoryId?: string;
  authorId?: string;
  isPinned?: boolean;
}) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.functions.forum.getThreads,
    options ?? {},
    { initialNumItems: 20 }
  );

  return {
    threads: results ?? [],
    isLoading: status === "LoadingFirstPage",
    isLoadingMore: status === "LoadingMore",
    canLoadMore: status === "CanLoadMore",
    loadMore: () => loadMore(20),
  };
}

// Hook to get a single thread
export function useThread(threadId: string) {
  const thread = useQuery(api.functions.forum.getThread, { threadId });
  return {
    thread: thread ?? null,
    isLoading: thread === undefined,
  };
}

// Hook to get posts for a thread
export function usePosts(threadId: string) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.functions.forum.getPosts,
    { threadId },
    { initialNumItems: 20 }
  );

  return {
    posts: results ?? [],
    isLoading: status === "LoadingFirstPage",
    isLoadingMore: status === "LoadingMore",
    canLoadMore: status === "CanLoadMore",
    loadMore: () => loadMore(20),
  };
}

// Hook to search threads
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
