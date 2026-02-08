import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Notification System Functions
 *
 * Queries and mutations for managing in-app notifications.
 * Notifications are created as side effects of forum actions (replies, upvotes, mentions, etc.)
 * and consumed via the bell icon dropdown and inbox page.
 *
 * @see Phase 01 plan — plans/forum-reddit-enhancements/phase-01-notification-system.md
 */

// ============================================================================
// Notification Type Validator
// ============================================================================

const notificationTypeValidator = v.union(
  v.literal("reply"),
  v.literal("upvote"),
  v.literal("mention"),
  v.literal("follow"),
  v.literal("thread_lock"),
  v.literal("thread_pin"),
  v.literal("mod_action"),
  v.literal("campaign")
);

const targetTypeValidator = v.union(
  v.literal("thread"),
  v.literal("post"),
  v.literal("comment"),
  v.literal("user")
);

// ============================================================================
// Internal Helper — Create Notification
// ============================================================================

/**
 * Upvote milestone thresholds.
 * Notifications are only sent when total upvotes on a target cross these values,
 * preventing notification spam from frequent upvotes.
 */
const UPVOTE_MILESTONES = [1, 5, 10, 25, 50, 100, 250, 500, 1000];

/**
 * Check whether the given notification type is enabled (push) for the user.
 * Falls back to `true` if no preferences row exists (opt-in by default).
 */
async function isNotificationEnabled(
  ctx: MutationCtx,
  userId: Id<"users">,
  type: string
): Promise<boolean> {
  const prefs = await ctx.db
    .query("notificationPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!prefs) return true; // Default: all notifications enabled

  // Map notification type to the corresponding push preference field
  const pushFieldMap: Record<string, keyof typeof prefs> = {
    reply: "replyPush",
    upvote: "upvotePush",
    mention: "mentionPush",
    follow: "followPush",
    campaign: "campaignPush",
  };

  const pushKey = pushFieldMap[type];
  if (!pushKey) return true; // Unknown type — default to enabled

  const value = prefs[pushKey];
  return typeof value === "boolean" ? value : true;
}

/**
 * Internal mutation to create a notification row.
 * Can be scheduled from other mutations via `ctx.scheduler.runAfter(0, ...)`.
 *
 * Rules:
 * - Never notify the actor themselves (recipientId !== actorId)
 * - Check notification preferences before inserting
 * - For upvotes, only notify at milestones
 */
export const createNotification = internalMutation({
  args: {
    tenantId: v.optional(v.id("tenants")),
    recipientId: v.id("users"),
    actorId: v.id("users"),
    type: notificationTypeValidator,
    targetType: targetTypeValidator,
    targetId: v.string(),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Never notify yourself
    if (args.recipientId === args.actorId) return null;

    // Check preferences
    const enabled = await isNotificationEnabled(
      ctx,
      args.recipientId,
      args.type
    );
    if (!enabled) return null;

    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      tenantId: args.tenantId,
      recipientId: args.recipientId,
      actorId: args.actorId,
      type: args.type,
      targetType: args.targetType,
      targetId: args.targetId,
      title: args.title,
      message: args.message,
      read: false,
      createdAt: now,
      updatedAt: now,
    });

    return notificationId;
  },
});

/**
 * Inline helper to insert a notification directly within a mutation context.
 * Use this when you want to create the notification in the same transaction.
 *
 * @param ctx - MutationCtx from the calling mutation
 * @param args - Notification fields
 * @returns The new notification ID, or null if skipped
 */
export async function insertNotification(
  ctx: MutationCtx,
  args: {
    tenantId?: Id<"tenants">;
    recipientId: Id<"users">;
    actorId: Id<"users">;
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
  }
): Promise<Id<"notifications"> | null> {
  // Never notify yourself
  if (args.recipientId === args.actorId) return null;

  // Check preferences
  const enabled = await isNotificationEnabled(
    ctx,
    args.recipientId,
    args.type
  );
  if (!enabled) return null;

  const now = Date.now();

  const notificationId = await ctx.db.insert("notifications", {
    tenantId: args.tenantId,
    recipientId: args.recipientId,
    actorId: args.actorId,
    type: args.type,
    targetType: args.targetType,
    targetId: args.targetId,
    title: args.title,
    message: args.message,
    read: false,
    createdAt: now,
    updatedAt: now,
  });

  return notificationId;
}

// ============================================================================
// Queries
// ============================================================================

/**
 * List notifications for the current user.
 *
 * Supports pagination and filtering by unread status.
 *
 * @param limit - Max notifications to return (default 20)
 * @param unreadOnly - If true, only return unread notifications
 * @returns List of notifications enriched with actor info
 */
export const listNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { notifications: [], hasMore: false };

    const limit = args.limit ?? 20;

    let notificationsQuery;
    if (args.unreadOnly) {
      notificationsQuery = ctx.db
        .query("notifications")
        .withIndex("by_recipient_unread", (q) =>
          q.eq("recipientId", userId).eq("read", false)
        )
        .order("desc");
    } else {
      notificationsQuery = ctx.db
        .query("notifications")
        .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
        .order("desc");
    }

    const notifications = await notificationsQuery.take(limit + 1);
    const hasMore = notifications.length > limit;
    const result = hasMore ? notifications.slice(0, limit) : notifications;

    // Enrich with actor info
    const enriched = await Promise.all(
      result.map(async (notification) => {
        const actor = await ctx.db.get(notification.actorId);
        const actorProfile = actor
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", actor._id))
              .first()
          : null;

        return {
          ...notification,
          actor: actor
            ? {
                id: actor._id,
                name:
                  actorProfile?.displayName ?? actor.name ?? "Someone",
                avatarUrl: actorProfile?.avatarUrl ?? null,
              }
            : null,
        };
      })
    );

    return {
      notifications: enriched,
      hasMore,
    };
  },
});

/**
 * Get the unread notification count for the bell icon badge.
 *
 * @returns number — count of unread notifications (capped at 99 for display)
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", userId).eq("read", false)
      )
      .take(100);

    return Math.min(unread.length, 99);
  },
});

/**
 * Get the current user's notification preferences.
 *
 * @returns Notification preferences or default values
 */
export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (prefs) return prefs;

    // Return defaults if no row exists yet
    return {
      _id: null,
      userId,
      replyEmail: true,
      replyPush: true,
      upvoteEmail: false,
      upvotePush: true,
      mentionEmail: true,
      mentionPush: true,
      followEmail: false,
      followPush: true,
      campaignEmail: true,
      campaignPush: true,
      weeklyDigest: true,
      createdAt: 0,
      updatedAt: 0,
    };
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Mark a single notification as read.
 *
 * @param notificationId - Notification to mark read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.recipientId !== userId) {
      throw new Error("Not authorized");
    }

    if (!notification.read) {
      const now = Date.now();
      await ctx.db.patch(args.notificationId, {
        read: true,
        readAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

/**
 * Mark all notifications as read for the current user.
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", userId).eq("read", false)
      )
      .collect();

    const now = Date.now();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        read: true,
        readAt: now,
        updatedAt: now,
      });
    }

    return { count: unread.length };
  },
});

/**
 * Update notification preferences (upsert).
 *
 * Creates a preferences row if one doesn't exist, otherwise patches.
 */
export const updatePreferences = mutation({
  args: {
    replyEmail: v.boolean(),
    replyPush: v.boolean(),
    upvoteEmail: v.boolean(),
    upvotePush: v.boolean(),
    mentionEmail: v.boolean(),
    mentionPush: v.boolean(),
    followEmail: v.boolean(),
    followPush: v.boolean(),
    campaignEmail: v.boolean(),
    campaignPush: v.boolean(),
    weeklyDigest: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const now = Date.now();

    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("notificationPreferences", {
        userId,
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }

    return true;
  },
});

// ============================================================================
// Exported helpers for use in forum.ts mutations
// ============================================================================

/**
 * Parse @mentions from content string.
 *
 * @param content - Post or comment content
 * @returns Array of unique usernames mentioned
 */
export function parseMentions(content: string): string[] {
  const mentionRegex = /@(\w{2,30})/g;
  const matches = content.matchAll(mentionRegex);
  const usernames = new Set<string>();
  for (const match of matches) {
    if (match[1]) {
      usernames.add(match[1].toLowerCase());
    }
  }
  return Array.from(usernames);
}

/**
 * Check if an upvote count is at a notification milestone.
 *
 * @param count - Current total upvote count (after the new upvote)
 * @returns true if a notification should be sent
 */
export function isUpvoteMilestone(count: number): boolean {
  return UPVOTE_MILESTONES.includes(count);
}
