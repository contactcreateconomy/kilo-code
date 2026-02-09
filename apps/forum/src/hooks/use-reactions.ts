"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";

type TargetType = "thread" | "post" | "comment";
type ReactionType = "upvote" | "downvote" | "bookmark";

/**
 * useReactions — Manages upvote/downvote/bookmark reactions via Convex.
 *
 * Fetches existing reactions for a set of targets and provides a toggle function.
 * Returns convenience helpers: hasReaction, hasUpvote, hasDownvote.
 *
 * @param targetType - "thread" | "post" | "comment"
 * @param targetIds - Array of target IDs to check for existing reactions
 */
export function useReactions(targetType: TargetType, targetIds: string[]) {
  const reactions = useQuery(
    api.functions.forum.getUserReactions,
    targetIds.length > 0 ? { targetType, targetIds } : "skip"
  );

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
      if (!reactions) return false;
      return reactions[targetId] === reactionType;
    },
    [reactions]
  );

  /**
   * Check if the current user has upvoted a specific target.
   */
  const hasUpvote = useCallback(
    (targetId: string): boolean => {
      if (!reactions) return false;
      return reactions[targetId] === "upvote";
    },
    [reactions]
  );

  /**
   * Check if the current user has downvoted a specific target.
   */
  const hasDownvote = useCallback(
    (targetId: string): boolean => {
      if (!reactions) return false;
      return reactions[targetId] === "downvote";
    },
    [reactions]
  );

  return {
    reactions: reactions ?? {},
    toggle,
    hasReaction,
    hasUpvote,
    hasDownvote,
    isLoading: reactions === undefined,
  };
}
