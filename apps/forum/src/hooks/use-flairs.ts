'use client';

import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import type { FunctionReturnType } from 'convex/server';
import { api } from '@createconomy/convex';
import {
  flairQueryArgs,
  toForumCategoryId,
  toForumThreadId,
  toPostFlairId,
  toUserId,
} from './forum-id-helpers';
import type { Id } from '@createconomy/convex/dataModel';
import type { QueryEnvelope, MutationEnvelope } from '@createconomy/ui/types/envelope';

type CategoryFlairsData = FunctionReturnType<typeof api.functions.flairs.getCategoryFlairs>;
type FlairData = FunctionReturnType<typeof api.functions.flairs.getFlair>;
type MyFlairData = FunctionReturnType<typeof api.functions.flairs.getMyFlair>;
type UserFlairData = FunctionReturnType<typeof api.functions.flairs.getUserFlair>;

type UseCategoryFlairsResult = QueryEnvelope<CategoryFlairsData> & {
  flairs: CategoryFlairsData;
};

type UseFlairByIdResult = QueryEnvelope<FlairData | null> & {
  flair: FlairData | null;
};

type FlairMutationActions = {
  setThreadFlair: (threadId: string, flairId: string | undefined) => Promise<void>;
  createPostFlair: (args: {
    categoryId: Id<"forumCategories">;
    displayName: string;
    backgroundColor: string;
    textColor: string;
    emoji?: string;
  }) => Promise<unknown>;
  updatePostFlair: (args: {
    flairId: Id<"postFlairs">;
    displayName?: string;
    backgroundColor?: string;
    textColor?: string;
    emoji?: string;
    isActive?: boolean;
  }) => Promise<unknown>;
};

type UseFlairMutationsResult = MutationEnvelope<FlairMutationActions> & FlairMutationActions;

type UseMyFlairResult = QueryEnvelope<MyFlairData | null> & {
  flair: MyFlairData | null;
  setFlair: (text: string, emoji?: string) => Promise<void>;
  removeFlair: () => Promise<void>;
};

type UseUserFlairResult = QueryEnvelope<UserFlairData | null> & {
  flair: UserFlairData | null;
};

/**
 * Hook for getting flairs available in a category.
 */
export function useCategoryFlairs(categoryId: string | undefined): UseCategoryFlairsResult {
  const flairs = useQuery(
    api.functions.flairs.getCategoryFlairs,
    categoryId ? { categoryId: toForumCategoryId(categoryId) } : 'skip'
  );
  const data = flairs ?? [];

  return {
    flairs: data,
    data,
    isLoading: flairs === undefined && !!categoryId,
    error: null,
  };
}

/**
 * Hook for getting a single flair by ID.
 */
export function useFlairById(flairId: string | undefined): UseFlairByIdResult {
  const flair = useQuery(api.functions.flairs.getFlair, flairQueryArgs(flairId));
  const data = flair ?? null;

  return {
    flair: data,
    data,
    isLoading: flair === undefined && !!flairId,
    error: null,
  };
}

/**
 * Hook for setting/removing a flair on a thread.
 */
export function useFlairMutations(): UseFlairMutationsResult {
  const setFlair = useMutation(api.functions.flairs.setThreadFlair);
  const createFlair = useMutation(api.functions.flairs.createPostFlair);
  const updateFlair = useMutation(api.functions.flairs.updatePostFlair);

  const setThreadFlair = useCallback(
    async (threadId: string, flairId: string | undefined) => {
      await setFlair({
        threadId: toForumThreadId(threadId),
        flairId: flairId ? toPostFlairId(flairId) : undefined,
      });
    },
    [setFlair]
  );

  const handleCreatePostFlair = useCallback(
    async (args: Parameters<FlairMutationActions["createPostFlair"]>[0]) => {
      return await createFlair(args as never);
    },
    [createFlair]
  );

  const handleUpdatePostFlair = useCallback(
    async (args: Parameters<FlairMutationActions["updatePostFlair"]>[0]) => {
      return await updateFlair(args as never);
    },
    [updateFlair]
  );

  const data: FlairMutationActions = {
    setThreadFlair,
    createPostFlair: handleCreatePostFlair,
    updatePostFlair: handleUpdatePostFlair,
  };

  return {
    ...data,
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Hook for the current user's flair.
 */
export function useMyFlair(categoryId?: string): UseMyFlairResult {
  const flair = useQuery(api.functions.flairs.getMyFlair, {
    categoryId: categoryId ? toForumCategoryId(categoryId) : undefined,
  });
  const setUserFlair = useMutation(api.functions.flairs.setUserFlair);
  const removeUserFlair = useMutation(api.functions.flairs.removeUserFlair);

  const setFlair = useCallback(
    async (text: string, emoji?: string) => {
      await setUserFlair({
        categoryId: categoryId ? toForumCategoryId(categoryId) : undefined,
        text,
        emoji,
      });
    },
    [categoryId, setUserFlair]
  );

  const removeFlair = useCallback(async () => {
    await removeUserFlair({
      categoryId: categoryId ? toForumCategoryId(categoryId) : undefined,
    });
  }, [categoryId, removeUserFlair]);

  const data = flair ?? null;

  return {
    flair: data,
    setFlair,
    removeFlair,
    data,
    isLoading: flair === undefined,
    error: null,
  };
}

/**
 * Hook for getting another user's flair.
 */
export function useUserFlair(userId: string | undefined, categoryId?: string): UseUserFlairResult {
  const flair = useQuery(
    api.functions.flairs.getUserFlair,
    userId
      ? {
          userId: toUserId(userId),
          categoryId: categoryId ? toForumCategoryId(categoryId) : undefined,
        }
      : 'skip'
  );
  const data = flair ?? null;

  return {
    flair: data,
    data,
    isLoading: flair === undefined && !!userId,
    error: null,
  };
}

