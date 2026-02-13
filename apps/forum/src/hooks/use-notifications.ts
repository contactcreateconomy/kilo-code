"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "@createconomy/convex";
import { toNotificationId } from "./forum-id-helpers";
import type { QueryEnvelope } from "@createconomy/ui/types/envelope";

/**
 * Notification type matching the enriched response from
 * `api.functions.notifications.listNotifications`.
 */
export interface NotificationItem {
  _id: string;
  type:
    | "reply"
    | "upvote"
    | "mention"
    | "follow"
    | "thread_lock"
    | "thread_pin"
    | "mod_action"
    | "campaign";
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

type NotificationsQueryResult = FunctionReturnType<
  typeof api.functions.notifications.listNotifications
>;
type NotificationsData = NonNullable<NotificationsQueryResult>;
type NotificationsRecord = NotificationsData["notifications"][number];
type UnreadCountData = FunctionReturnType<
  typeof api.functions.notifications.getUnreadCount
>;
type PreferencesQueryData = FunctionReturnType<
  typeof api.functions.notifications.getPreferences
>;

type NotificationActions = {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

type UseNotificationsResult = QueryEnvelope<NotificationsData> & {
  notifications: NotificationItem[];
  unreadCount: UnreadCountData;
  hasMore: boolean;
} & NotificationActions;

type UseNotificationPreferencesResult =
  QueryEnvelope<NotificationPreferences | null> & {
    preferences: NotificationPreferences | null;
    updatePreferences: (newPrefs: NotificationPreferences) => Promise<void>;
  };

function toNotificationItem(notification: NotificationsRecord): NotificationItem {
  return {
    _id: notification._id,
    type: notification.type,
    targetType: notification.targetType,
    targetId: notification.targetId,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    actor: notification.actor
      ? {
          id: notification.actor.id,
          name: notification.actor.name,
          avatarUrl: notification.actor.avatarUrl,
        }
      : null,
  };
}

function toNotificationPreferences(
  prefs: PreferencesQueryData
): NotificationPreferences | null {
  if (!prefs) {
    return null;
  }

  return {
    replyEmail: prefs.replyEmail,
    replyPush: prefs.replyPush,
    upvoteEmail: prefs.upvoteEmail,
    upvotePush: prefs.upvotePush,
    mentionEmail: prefs.mentionEmail,
    mentionPush: prefs.mentionPush,
    followEmail: prefs.followEmail,
    followPush: prefs.followPush,
    campaignEmail: prefs.campaignEmail,
    campaignPush: prefs.campaignPush,
    weeklyDigest: prefs.weeklyDigest,
  };
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
export function useNotifications(
  limit = 20,
  unreadOnly = false
): UseNotificationsResult {
  const result = useQuery(api.functions.notifications.listNotifications, {
    limit,
    unreadOnly,
  });

  const unreadCount = useQuery(api.functions.notifications.getUnreadCount, {});

  const markAsReadMutation = useMutation(api.functions.notifications.markAsRead);
  const markAllAsReadMutation = useMutation(
    api.functions.notifications.markAllAsRead
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      await markAsReadMutation({
        notificationId: toNotificationId(notificationId),
      });
    },
    [markAsReadMutation]
  );

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation({});
  }, [markAllAsReadMutation]);

  const data: NotificationsData = result ?? { notifications: [], hasMore: false };

  const notifications = useMemo(
    () => data.notifications.map(toNotificationItem),
    [data.notifications]
  );

  return {
    notifications,
    unreadCount: unreadCount ?? 0,
    hasMore: data.hasMore,
    markAsRead,
    markAllAsRead,
    data,
    isLoading: result === undefined,
    error: null,
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
export function useNotificationPreferences(): UseNotificationPreferencesResult {
  const prefs = useQuery(api.functions.notifications.getPreferences, {});

  const updateMutation = useMutation(
    api.functions.notifications.updatePreferences
  );

  const updatePreferences = useCallback(
    async (newPrefs: NotificationPreferences) => {
      await updateMutation(newPrefs);
    },
    [updateMutation]
  );

  const preferences = toNotificationPreferences(prefs ?? null);

  return {
    preferences,
    updatePreferences,
    data: preferences,
    isLoading: prefs === undefined,
    error: null,
  };
}
