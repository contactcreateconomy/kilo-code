"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";

/**
 * useFollow — Manages follow/unfollow state for a target user.
 *
 * Queries the current follow status and provides a toggle function.
 * Handles optimistic UI via loading state.
 *
 * @param userId - The ID of the user to follow/unfollow (pass undefined to skip)
 */
export function useFollow(userId: Id<"users"> | string | undefined) {
  const [isToggling, setIsToggling] = useState(false);

  const followStatus = useQuery(
    api.functions.social.getFollowStatus,
    userId ? { userId: userId as never } : "skip"
  );

  const followMutation = useMutation(api.functions.social.followUser);
  const unfollowMutation = useMutation(api.functions.social.unfollowUser);

  const toggle = useCallback(async () => {
    if (!userId || isToggling) return;

    setIsToggling(true);
    try {
      if (followStatus?.isFollowing) {
        await unfollowMutation({ userId: userId as never });
      } else {
        await followMutation({ userId: userId as never });
      }
    } finally {
      setIsToggling(false);
    }
  }, [followStatus?.isFollowing, userId, isToggling, followMutation, unfollowMutation]);

  return {
    isFollowing: followStatus?.isFollowing ?? false,
    isLoading: followStatus === undefined,
    isToggling,
    toggle,
  };
}
