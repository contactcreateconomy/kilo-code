"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import {
  toForumCategoryId,
  toForumThreadId,
} from "./forum-id-helpers";

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

/**
 * Hook for thread-related mutations.
 *
 * Provides `createThread`, `updateThread`, `deleteThread`, and `viewThread`.
 */
export function useThreadMutations() {
  const createThread = useMutation(api.functions.forum.createThread);
  const updateThread = useMutation(api.functions.forum.updateThread);
  const deleteThread = useMutation(api.functions.forum.deleteThread);
  const incrementViewCount = useMutation(api.functions.forum.incrementThreadViewCount);

  const handleCreateThread = useCallback(
    async (data: CreateThreadInput) => {
      return await createThread({
        title: data.title,
        content: data.content,
        categoryId: toForumCategoryId(data.categoryId),
      });
    },
    [createThread]
  );

  const handleUpdateThread = useCallback(
    async (threadId: string, data: UpdateThreadInput) => {
      return await updateThread({ threadId: toForumThreadId(threadId), ...data });
    },
    [updateThread]
  );

  const handleDeleteThread = useCallback(
    async (threadId: string) => {
      return await deleteThread({ threadId: toForumThreadId(threadId) });
    },
    [deleteThread]
  );

  const handleViewThread = useCallback(
    async (threadId: string) => {
      return await incrementViewCount({ threadId: toForumThreadId(threadId) });
    },
    [incrementViewCount]
  );

  return {
    createThread: handleCreateThread,
    updateThread: handleUpdateThread,
    deleteThread: handleDeleteThread,
    viewThread: handleViewThread,
  };
}
