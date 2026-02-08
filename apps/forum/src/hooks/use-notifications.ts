"use client";

import { useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@createconomy/convex";

/**
 * Notification type matching the enriched response from
 * `api.functions.notifications.listNotifications`.
 */
export interface NotificationItem {
  _id: string;
  type: "reply" | "upvote" | "mention" | "follow" | "thread_lock" | "thread_pin" | "mod_action" | "campaign";
  targetType: "thread" | "post" | "comment" | "user";
  targetId: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: number;
  createdAt: number;
  actor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

/**
 * useNotifications — Manages notification state via Convex reactive queries.
 *
 * Provides:
 * - `notifications` — enriched notification list (with actor info)
 * - `unreadCount` — badge count for bell icon
 * - `markAsRead` — mark single notification read
 * - `markAllAsRead` — mark all read
 * - `isLoading` — true while first fetch is in progress
 * - `hasMore` — pagination flag
 *
 * @param limit — Max notifications per page (default 20)
 * @param unreadOnly — Filter to unread only
 */
export function useNotifications(limit = 20, unreadOnly = false) {
  const result = useQuery(
    api.functions.notifications.listNotifications,
    { limit, unreadOnly }
  );

  const unreadCount = useQuery(
    api.functions.notifications.getUnreadCount,
    {}
  );

  const markAsReadMutation = useMutation(
    api.functions.notifications.markAsRead
  );

  const markAllAsReadMutation = useMutation(
    api.functions.notifications.markAllAsRead
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await markAsReadMutation({
        notificationId: notificationId as never,
      });
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation({});
  }, [markAllAsReadMutation]);

  return {
    notifications: (result?.notifications ?? []) as NotificationItem[],
    unreadCount: unreadCount ?? 0,
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Notification preferences shape matching the Convex query response.
 */
export interface NotificationPreferences {
  replyEmail: boolean;
  replyPush: boolean;
  upvoteEmail: boolean;
  upvotePush: boolean;
  mentionEmail: boolean;
  mentionPush: boolean;
  followEmail: boolean;
  followPush: boolean;
  campaignEmail: boolean;
  campaignPush: boolean;
  weeklyDigest: boolean;
}

/**
 * useNotificationPreferences — Load and save notification settings.
 */
export function useNotificationPreferences() {
  const prefs = useQuery(
    api.functions.notifications.getPreferences,
    {}
  );

  const updateMutation = useMutation(
    api.functions.notifications.updatePreferences
  );

  const updatePreferences = useCallback(
    async (newPrefs: NotificationPreferences) => {
      await updateMutation(newPrefs);
    },
    [updateMutation]
  );

  return {
    preferences: prefs as NotificationPreferences | null,
    isLoading: prefs === undefined,
    updatePreferences,
  };
}
