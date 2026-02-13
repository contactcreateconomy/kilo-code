"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@createconomy/convex";
import type { QueryEnvelope } from "@createconomy/ui/types/envelope";

type TargetType = "thread" | "post" | "comment";
type ReactionType = "upvote" | "downvote" | "bookmark";

type ReactionMap = FunctionReturnType<typeof api.functions.forum.getUserReactions>;

type UseReactionsResult = QueryEnvelope<ReactionMap> & {
  reactions: ReactionMap;
  toggle: (targetId: string, reactionType: ReactionType) => Promise<{ action: "added" | "removed" | "switched" }>;
  hasReaction: (targetId: string, reactionType: ReactionType) => boolean;
  hasUpvote: (targetId: string) => boolean;
  hasDownvote: (targetId: string) => boolean;
};

/**
 * useReactions — Manages upvote/downvote/bookmark reactions via Convex.
 *
 * Fetches existing reactions for a set of targets and provides a toggle function.
 * Returns convenience helpers: hasReaction, hasUpvote, hasDownvote.
 *
 * @param targetType - "thread" | "post" | "comment"
 * @param targetIds - Array of target IDs to check for existing reactions
 */
export function useReactions(
  targetType: TargetType,
  targetIds: string[]
): UseReactionsResult {
  const reactions = useQuery(
    api.functions.forum.getUserReactions,
    targetIds.length > 0 ? { targetType, targetIds } : "skip"
  );
  const data: ReactionMap = reactions ?? {};

  const toggleMutation = useMutation(api.functions.forum.toggleReaction);

  const toggle = useCallback(
    async (targetId: string, reactionType: ReactionType) => {
      return await toggleMutation({ targetType, targetId, reactionType });
    },
    [toggleMutation, targetType]
  );

  /**
   * Check if a specific target has a given reaction type from the current user.
   */
  const hasReaction = useCallback(
    (targetId: string, reactionType: ReactionType): boolean => {
      return data[targetId] === reactionType;
    },
    [data]
  );

  /**
   * Check if the current user has upvoted a specific target.
   */
  const hasUpvote = useCallback(
    (targetId: string): boolean => {
      return data[targetId] === "upvote";
    },
    [data]
  );

  /**
   * Check if the current user has downvoted a specific target.
   */
  const hasDownvote = useCallback(
    (targetId: string): boolean => {
      return data[targetId] === "downvote";
    },
    [data]
  );

  return {
    reactions: data,
    data,
    toggle,
    hasReaction,
    hasUpvote,
    hasDownvote,
    isLoading: targetIds.length > 0 && reactions === undefined,
    error: null,
  };
}
