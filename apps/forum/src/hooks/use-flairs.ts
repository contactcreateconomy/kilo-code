'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@createconomy/convex';
import type { Id } from '@createconomy/convex/dataModel';

/**
 * Hook for getting flairs available in a category.
 */
export function useCategoryFlairs(categoryId: string | undefined) {
  const flairs = useQuery(
    api.functions.flairs.getCategoryFlairs,
    categoryId
      ? { categoryId: categoryId as Id<'forumCategories'> }
      : 'skip'
  );

  return {
    flairs: flairs ?? [],
    isLoading: flairs === undefined && !!categoryId,
  };
}

/**
 * Hook for getting a single flair by ID.
 */
export function useFlairById(flairId: string | undefined) {
  const flair = useQuery(
    api.functions.flairs.getFlair,
    flairId ? { flairId: flairId as Id<'postFlairs'> } : 'skip'
  );

  return {
    flair: flair ?? null,
    isLoading: flair === undefined && !!flairId,
  };
}

/**
 * Hook for setting/removing a flair on a thread.
 */
export function useFlairMutations() {
  const setFlair = useMutation(api.functions.flairs.setThreadFlair);
  const createFlair = useMutation(api.functions.flairs.createPostFlair);
  const updateFlair = useMutation(api.functions.flairs.updatePostFlair);

  return {
    setThreadFlair: async (threadId: string, flairId: string | undefined) => {
      await setFlair({
        threadId: threadId as never,
        flairId: flairId ? (flairId as never) : undefined,
      });
    },
    createPostFlair: createFlair,
    updatePostFlair: updateFlair,
  };
}

/**
 * Hook for the current user's flair.
 */
export function useMyFlair(categoryId?: string) {
  const flair = useQuery(api.functions.flairs.getMyFlair, {
    categoryId: categoryId ? (categoryId as Id<'forumCategories'>) : undefined,
  });
  const setUserFlair = useMutation(api.functions.flairs.setUserFlair);
  const removeUserFlair = useMutation(api.functions.flairs.removeUserFlair);

  return {
    flair: flair ?? null,
    isLoading: flair === undefined,
    setFlair: async (text: string, emoji?: string) => {
      await setUserFlair({
        categoryId: categoryId
          ? (categoryId as Id<'forumCategories'>)
          : undefined,
        text,
        emoji,
      });
    },
    removeFlair: async () => {
      await removeUserFlair({
        categoryId: categoryId
          ? (categoryId as Id<'forumCategories'>)
          : undefined,
      });
    },
  };
}

/**
 * Hook for getting another user's flair.
 */
export function useUserFlair(userId: string | undefined, categoryId?: string) {
  const flair = useQuery(
    api.functions.flairs.getUserFlair,
    userId
      ? {
          userId: userId as Id<'users'>,
          categoryId: categoryId
            ? (categoryId as Id<'forumCategories'>)
            : undefined,
        }
      : 'skip'
  );

  return {
    flair: flair ?? null,
    isLoading: flair === undefined && !!userId,
  };
}
