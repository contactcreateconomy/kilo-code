"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import { toForumThreadId, toForumPostId } from "./forum-id-helpers";

/**
 * Hook for post-related mutations.
 *
 * Provides `createPost`, `updatePost`, and `deletePost`.
 */
export function usePostMutations() {
  const createPost = useMutation(api.functions.forum.createPost);
  const updatePost = useMutation(api.functions.forum.updatePost);
  const deletePost = useMutation(api.functions.forum.deletePost);

  const handleCreatePost = useCallback(
    async (data: { threadId: string; content: string }) => {
      return await createPost({
        threadId: toForumThreadId(data.threadId),
        content: data.content,
      });
    },
    [createPost]
  );

  const handleUpdatePost = useCallback(
    async (postId: string, content: string) => {
      return await updatePost({ postId: toForumPostId(postId), content });
    },
    [updatePost]
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      return await deletePost({ postId: toForumPostId(postId) });
    },
    [deletePost]
  );

  return {
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
  };
}
