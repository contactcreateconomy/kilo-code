"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";

export type CommentSortBy = "best" | "top" | "new" | "controversial";

/**
 * useThreadComments — Fetches thread + top-level comments from the new comment system.
 */
export function useThreadComments(
  threadId: string | undefined,
  sortBy: CommentSortBy = "best",
  limit = 20
) {
  const result = useQuery(
    api.functions.comments.getThreadWithComments,
    threadId
      ? { threadId: threadId as never, sortBy, limit }
      : "skip"
  );

  return {
    thread: result?.thread ?? null,
    comments: result?.comments ?? [],
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}

/**
 * useCommentReplies — Fetches replies to a specific comment (for "load more").
 */
export function useCommentReplies(
  parentId: string | undefined,
  sortBy: CommentSortBy = "best",
  limit = 10
) {
  const result = useQuery(
    api.functions.comments.getCommentReplies,
    parentId
      ? { parentId: parentId as never, sortBy, limit }
      : "skip"
  );

  return {
    replies: result?.replies ?? [],
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
  };
}

/**
 * useCommentActions — Mutations for creating, updating, and deleting comments.
 */
export function useCommentActions() {
  const createMutation = useMutation(
    api.functions.comments.createThreadComment
  );
  const updateMutation = useMutation(
    api.functions.comments.updateThreadComment
  );
  const deleteMutation = useMutation(
    api.functions.comments.deleteThreadComment
  );

  const createComment = useCallback(
    async (data: {
      threadId: string;
      content: string;
      parentId?: string;
    }) => {
      return await createMutation({
        threadId: data.threadId as never,
        content: data.content,
        parentId: data.parentId
          ? (data.parentId as never)
          : undefined,
      });
    },
    [createMutation]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      return await updateMutation({
        commentId: commentId as never,
        content,
      });
    },
    [updateMutation]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      return await deleteMutation({
        commentId: commentId as never,
      });
    },
    [deleteMutation]
  );

  return { createComment, updateComment, deleteComment };
}
