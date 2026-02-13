"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { toCommentId, toForumThreadId } from "./forum-id-helpers";
import type { QueryEnvelope, MutationEnvelope } from "@createconomy/ui/types/envelope";

export type CommentSortBy = "best" | "top" | "new" | "controversial";

type ThreadCommentsQueryResult = FunctionReturnType<
  typeof api.functions.comments.getThreadWithComments
>;
type ThreadCommentsData = NonNullable<ThreadCommentsQueryResult>;
type CommentRepliesData = FunctionReturnType<
  typeof api.functions.comments.getCommentReplies
>;

type CommentActions = {
  createComment: (input: {
    threadId: string;
    content: string;
    parentId?: string;
  }) => Promise<Id<"comments">>;
  updateComment: (commentId: string, content: string) => Promise<boolean>;
  deleteComment: (commentId: string) => Promise<boolean>;
};

type UseThreadCommentsResult = QueryEnvelope<ThreadCommentsData | null> & {
  thread: ThreadCommentsData["thread"] | null;
  comments: ThreadCommentsData["comments"];
  hasMore: boolean;
};

type UseCommentRepliesResult = QueryEnvelope<CommentRepliesData> & {
  replies: CommentRepliesData["replies"];
  hasMore: boolean;
};

type UseCommentActionsResult = MutationEnvelope<CommentActions> & CommentActions;

/**
 * useThreadComments — Fetches thread + top-level comments from the new comment system.
 */
export function useThreadComments(
  threadId: string | undefined,
  sortBy: CommentSortBy = "best",
  limit = 20
): UseThreadCommentsResult {
  const result = useQuery(
    api.functions.comments.getThreadWithComments,
    threadId
      ? { threadId: toForumThreadId(threadId), sortBy, limit }
      : "skip"
  );
  const data = result ?? null;

  return {
    thread: data?.thread ?? null,
    comments: data?.comments ?? [],
    hasMore: data?.hasMore ?? false,
    data,
    isLoading: !!threadId && result === undefined,
    error: null,
  };
}

/**
 * useCommentReplies — Fetches replies to a specific comment (for "load more").
 */
export function useCommentReplies(
  parentId: string | undefined,
  sortBy: CommentSortBy = "best",
  limit = 10
): UseCommentRepliesResult {
  const result = useQuery(
    api.functions.comments.getCommentReplies,
    parentId ? { parentId: toCommentId(parentId), sortBy, limit } : "skip"
  );
  const data: CommentRepliesData = result ?? { replies: [], hasMore: false };

  return {
    replies: data.replies,
    hasMore: data.hasMore,
    data,
    isLoading: !!parentId && result === undefined,
    error: null,
  };
}

/**
 * useCommentActions — Mutations for creating, updating, and deleting comments.
 */
export function useCommentActions(): UseCommentActionsResult {
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
    async (input: {
      threadId: string;
      content: string;
      parentId?: string;
    }) => {
      return await createMutation({
        threadId: toForumThreadId(input.threadId),
        content: input.content,
        parentId: input.parentId ? toCommentId(input.parentId) : undefined,
      });
    },
    [createMutation]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      return await updateMutation({
        commentId: toCommentId(commentId),
        content,
      });
    },
    [updateMutation]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      return await deleteMutation({
        commentId: toCommentId(commentId),
      });
    },
    [deleteMutation]
  );

  const data: CommentActions = { createComment, updateComment, deleteComment };

  return {
    ...data,
    data,
    isLoading: false,
    error: null,
  };
}
