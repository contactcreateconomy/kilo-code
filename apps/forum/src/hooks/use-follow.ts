"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { followUserQueryArgs, toUserId } from "./forum-id-helpers";
import type { QueryEnvelope } from "@createconomy/ui/types/envelope";

type FollowData = {
  isFollowing: boolean;
  isToggling: boolean;
};

type UseFollowResult = QueryEnvelope<FollowData> & FollowData & {
  toggle: () => Promise<void>;
};

/**
 * useFollow — Manages follow/unfollow state for a target user.
 *
 * Queries the current follow status and provides a toggle function.
 * Handles optimistic UI via loading state.
 *
 * @param userId - The ID of the user to follow/unfollow (pass undefined to skip)
 */
export function useFollow(userId: Id<"users"> | string | undefined): UseFollowResult {
  const [isToggling, setIsToggling] = useState(false);

  const followStatus = useQuery(
    api.functions.social.getFollowStatus,
    followUserQueryArgs(userId)
  );

  const followMutation = useMutation(api.functions.social.followUser);
  const unfollowMutation = useMutation(api.functions.social.unfollowUser);

  const toggle = useCallback(async () => {
    if (!userId || isToggling) return;

    setIsToggling(true);
    try {
      if (followStatus?.isFollowing) {
        await unfollowMutation({ userId: toUserId(userId) });
      } else {
        await followMutation({ userId: toUserId(userId) });
      }
    } finally {
      setIsToggling(false);
    }
  }, [followStatus?.isFollowing, userId, isToggling, followMutation, unfollowMutation]);

  const data: FollowData = {
    isFollowing: followStatus?.isFollowing ?? false,
    isToggling,
  };

  return {
    ...data,
    toggle,
    data,
    isLoading: !!userId && followStatus === undefined,
    error: null,
  };
}
