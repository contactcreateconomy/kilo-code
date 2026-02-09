import { query, mutation } from "../_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  checkRateLimitWithDb,
  rateLimitConfigs,
} from "../lib/security";
import { insertNotification } from "./notifications";

/**
 * Moderation System Functions
 *
 * Report submission, moderation queue, mod actions, ban management.
 *
 * @see Phase 04 plan — plans/forum-reddit-enhancements/phase-04-moderation.md
 */

// ============================================================================
// Validators
// ============================================================================

const reportReasonValidator = v.union(
  v.literal("spam"),
  v.literal("harassment"),
  v.literal("hate_speech"),
  v.literal("misinformation"),
  v.literal("nsfw"),
  v.literal("off_topic"),
  v.literal("self_harm"),
  v.literal("violence"),
  v.literal("other")
);

const reportStatusValidator = v.union(
  v.literal("pending"),
  v.literal("reviewed"),
  v.literal("actioned"),
  v.literal("dismissed")
);

const reportTargetTypeValidator = v.union(
  v.literal("thread"),
  v.literal("comment"),
  v.literal("user")
);

const modActionValidator = v.union(
  v.literal("remove"),
  v.literal("approve"),
  v.literal("lock"),
  v.literal("unlock"),
  v.literal("pin"),
  v.literal("unpin"),
  v.literal("warn"),
  v.literal("ban"),
  v.literal("unban"),
  v.literal("mute"),
  v.literal("unmute")
);

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Require the user to be authenticated and have moderator or admin role.
 * Returns the userId and userProfile.
 */
async function requireModerator(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!profile) throw new ConvexError({ code: "UNAUTHORIZED", message: "Profile not found" });

  if (profile.defaultRole !== "admin" && profile.defaultRole !== "moderator") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Moderator access required" });
  }

  return { userId, profile };
}

/**
 * Check if a user is currently banned (read-only check).
 *
 * Returns true if the user has an active, non-expired ban.
 * Does NOT mutate expired bans — rely on the scheduled `cleanupExpiredBans`
 * or the mutation variant `checkBanStatus` for cleanup.
 */
async function isUserBanned(ctx: QueryCtx | MutationCtx, userId: Id<"users">): Promise<boolean> {
  const activeBan = await ctx.db
    .query("userBans")
    .withIndex("by_user", (q) => q.eq("userId", userId).eq("isActive", true))
    .first();

  if (!activeBan) return false;

  // Check if temp ban has expired — treat as not banned even if record is stale
  if (!activeBan.isPermanent && activeBan.expiresAt && activeBan.expiresAt <= Date.now()) {
    return false;
  }

  return true;
}

/**
 * Check if a user is currently muted (read-only check).
 *
 * Returns true if the user has an active, non-expired mute.
 * Does NOT mutate expired mutes — rely on the scheduled cleanup
 * or the mutation variant `checkMuteStatus` for cleanup.
 */
async function isUserMuted(ctx: QueryCtx | MutationCtx, userId: Id<"users">): Promise<boolean> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!profile || !profile.isMuted) return false;

  // Check if mute has expired — treat as not muted even if record is stale
  if (profile.mutedUntil && profile.mutedUntil <= Date.now()) {
    return false;
  }

  return true;
}

/**
 * Log a moderation action for audit trail.
 */
async function logModAction(
  ctx: MutationCtx,
  args: {
    moderatorId: Id<"users">;
    targetType: "thread" | "comment" | "user";
    targetId: string;
    action: "remove" | "approve" | "lock" | "unlock" | "pin" | "unpin" | "warn" | "ban" | "unban" | "mute" | "unmute";
    reason?: string;
    reportId?: Id<"reports">;
    tenantId?: Id<"tenants">;
  }
) {
  await ctx.db.insert("modActions", {
    tenantId: args.tenantId,
    moderatorId: args.moderatorId,
    targetType: args.targetType,
    targetId: args.targetId,
    action: args.action,
    reason: args.reason,
    reportId: args.reportId,
    createdAt: Date.now(),
  });
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Get moderation dashboard stats — pending reports, actions today, active bans.
 *
 * Uses bounded queries instead of collecting entire tables.
 */
export const getModStats = query({
  args: {},
  handler: async (ctx) => {
    await requireModerator(ctx);

    const now = Date.now();
    const todayStart = now - (now % 86400000); // midnight UTC
    const weekStart = now - 7 * 86400000;

    // Pending reports — count up to a reasonable cap
    const pendingReports = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(1000);

    // Actions today / this week — fetch only recent actions (bounded by week window)
    // We iterate from newest and stop once we pass the week boundary.
    const recentActions = await ctx.db
      .query("modActions")
      .order("desc")
      .take(200);
    let actionsToday = 0;
    let actionsThisWeek = 0;
    for (const action of recentActions) {
      if (action.createdAt < weekStart) break;
      actionsThisWeek++;
      if (action.createdAt >= todayStart) {
        actionsToday++;
      }
    }

    // Active bans — count up to a reasonable cap
    const activeBans = await ctx.db
      .query("userBans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .take(1000);

    return {
      pendingReports: pendingReports.length,
      reviewedToday: actionsToday,
      actionsThisWeek,
      activeBans: activeBans.length,
    };
  },
});

/**
 * List reports with optional filters — for the moderation queue.
 */
export const listReports = query({
  args: {
    status: v.optional(reportStatusValidator),
    targetType: v.optional(reportTargetTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireModerator(ctx);

    const limit = args.limit ?? 50;

    let reportsQuery;
    if (args.status) {
      reportsQuery = ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc");
    } else {
      reportsQuery = ctx.db.query("reports").order("desc");
    }

    let reports = await reportsQuery.take(limit);

    // Filter by targetType in memory if specified
    if (args.targetType) {
      reports = reports.filter((r) => r.targetType === args.targetType);
    }

    // Enrich with reporter and target author info
    const enriched = await Promise.all(
      reports.map(async (report) => {
        const reporter = await ctx.db.get(report.reporterId);
        const reporterProfile = reporter
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", reporter._id))
              .first()
          : null;

        const targetAuthor = await ctx.db.get(report.targetAuthorId);
        const targetAuthorProfile = targetAuthor
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", targetAuthor._id))
              .first()
          : null;

        const reviewedByUser = report.reviewedBy
          ? await ctx.db.get(report.reviewedBy)
          : null;
        const reviewedByProfile = reviewedByUser
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", reviewedByUser._id))
              .first()
          : null;

        // Fetch content preview based on target type
        let contentPreview: string | null = null;
        if (report.targetType === "thread") {
          const thread = await ctx.db.get(report.targetId as Id<"forumThreads">);
          contentPreview = thread ? thread.title : "[deleted thread]";
        } else if (report.targetType === "comment") {
          const comment = await ctx.db.get(report.targetId as Id<"comments">);
          contentPreview = comment
            ? comment.content.slice(0, 200)
            : "[deleted comment]";
        }

        return {
          ...report,
          reporter: reporter
            ? {
                id: reporter._id,
                name: reporterProfile?.displayName ?? reporter.name ?? "Unknown",
                username: reporterProfile?.username ?? "unknown",
              }
            : null,
          targetAuthor: targetAuthor
            ? {
                id: targetAuthor._id,
                name: targetAuthorProfile?.displayName ?? targetAuthor.name ?? "Unknown",
                username: targetAuthorProfile?.username ?? "unknown",
              }
            : null,
          reviewedByName: reviewedByProfile?.displayName ?? reviewedByUser?.name ?? null,
          contentPreview,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get a single report with full detail.
 */
export const getReport = query({
  args: {
    reportId: v.id("reports"),
  },
  handler: async (ctx, args) => {
    await requireModerator(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new ConvexError({ code: "NOT_FOUND", message: "Report not found" });

    return report;
  },
});

/**
 * Get moderation action log for a target or moderator.
 */
export const getModActions = query({
  args: {
    targetType: v.optional(reportTargetTypeValidator),
    targetId: v.optional(v.string()),
    moderatorId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireModerator(ctx);

    const limit = args.limit ?? 50;

    let actionsQuery;
    if (args.moderatorId) {
      actionsQuery = ctx.db
        .query("modActions")
        .withIndex("by_moderator", (q) => q.eq("moderatorId", args.moderatorId!))
        .order("desc");
    } else if (args.targetType && args.targetId) {
      actionsQuery = ctx.db
        .query("modActions")
        .withIndex("by_target", (q) =>
          q.eq("targetType", args.targetType!).eq("targetId", args.targetId!)
        )
        .order("desc");
    } else {
      actionsQuery = ctx.db.query("modActions").order("desc");
    }

    const actions = await actionsQuery.take(limit);

    // Enrich with moderator info
    const enriched = await Promise.all(
      actions.map(async (action) => {
        const mod = await ctx.db.get(action.moderatorId);
        const modProfile = mod
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", mod._id))
              .first()
          : null;

        return {
          ...action,
          moderatorName: modProfile?.displayName ?? mod?.name ?? "Unknown",
        };
      })
    );

    return enriched;
  },
});

/**
 * Check if a user is currently banned — public query used by forum functions.
 */
export const getUserBanStatus = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await getAuthUserId(ctx));
    if (!userId) return null;

    const activeBan = await ctx.db
      .query("userBans")
      .withIndex("by_user", (q) => q.eq("userId", userId).eq("isActive", true))
      .first();

    if (!activeBan) return null;

    // Check if temp ban expired
    if (!activeBan.isPermanent && activeBan.expiresAt && activeBan.expiresAt <= Date.now()) {
      return null;
    }

    return {
      isBanned: true,
      reason: activeBan.reason,
      isPermanent: activeBan.isPermanent,
      expiresAt: activeBan.expiresAt ?? null,
    };
  },
});

/**
 * List active bans — for the admin bans tab.
 */
export const listBans = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireModerator(ctx);

    const limit = args.limit ?? 50;

    const bans = await ctx.db
      .query("userBans")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);

    // Enrich
    const enriched = await Promise.all(
      bans.map(async (ban) => {
        const user = await ctx.db.get(ban.userId);
        const userProfile = user
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first()
          : null;

        const bannedByUser = await ctx.db.get(ban.bannedBy);
        const bannedByProfile = bannedByUser
          ? await ctx.db
              .query("userProfiles")
              .withIndex("by_user", (q) => q.eq("userId", bannedByUser._id))
              .first()
          : null;

        return {
          ...ban,
          userName: userProfile?.displayName ?? user?.name ?? "Unknown",
          userUsername: userProfile?.username ?? "unknown",
          bannedByName: bannedByProfile?.displayName ?? bannedByUser?.name ?? "Unknown",
        };
      })
    );

    return enriched;
  },
});

// ============================================================================
// Mutations — Report Submission
// ============================================================================

/**
 * Submit a report — rate limited to 10 per day.
 *
 * Prevents duplicate reports from the same user on the same target.
 */
export const createReport = mutation({
  args: {
    targetType: reportTargetTypeValidator,
    targetId: v.string(),
    reason: reportReasonValidator,
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });

    // Rate limit
    await checkRateLimitWithDb(
      ctx,
      `report:${userId}`,
      rateLimitConfigs.reportSubmission
    );

    // Prevent duplicate reports — use indexed query with DB-side filter
    // to avoid scanning all user reports in memory
    const duplicate = await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("targetType"), args.targetType),
          q.eq(q.field("targetId"), args.targetId),
          q.or(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("status"), "reviewed")
          )
        )
      )
      .first();

    if (duplicate) {
      throw new ConvexError({
        code: "DUPLICATE",
        message: "You have already reported this content",
      });
    }

    // Determine the target author
    let targetAuthorId: Id<"users"> | null = null;

    if (args.targetType === "thread") {
      const thread = await ctx.db.get(args.targetId as Id<"forumThreads">);
      if (!thread) throw new ConvexError({ code: "NOT_FOUND", message: "Thread not found" });
      targetAuthorId = thread.authorId;
    } else if (args.targetType === "comment") {
      const comment = await ctx.db.get(args.targetId as Id<"comments">);
      if (!comment) throw new ConvexError({ code: "NOT_FOUND", message: "Comment not found" });
      targetAuthorId = comment.authorId;
    } else if (args.targetType === "user") {
      const targetUser = await ctx.db.get(args.targetId as Id<"users">);
      if (!targetUser) throw new ConvexError({ code: "NOT_FOUND", message: "User not found" });
      targetAuthorId = targetUser._id;
    }

    if (!targetAuthorId) {
      throw new ConvexError({ code: "INVALID", message: "Could not determine target author" });
    }

    // Can't report yourself
    if (targetAuthorId === userId) {
      throw new ConvexError({ code: "INVALID", message: "You cannot report your own content" });
    }

    const now = Date.now();

    const reportId = await ctx.db.insert("reports", {
      reporterId: userId,
      targetType: args.targetType,
      targetId: args.targetId,
      targetAuthorId: targetAuthorId,
      reason: args.reason,
      details: args.details?.slice(0, 500),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Notify moderators (find all mods/admins)
    const modProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("defaultRole", "moderator"))
      .collect();
    const adminProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_role", (q) => q.eq("defaultRole", "admin"))
      .collect();

    const modUserIds = [...modProfiles, ...adminProfiles].map((p) => p.userId);

    // Get reporter name
    const reporterProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const reporterName = reporterProfile?.displayName ?? "Someone";

    const reasonLabels: Record<string, string> = {
      spam: "Spam",
      harassment: "Harassment",
      hate_speech: "Hate Speech",
      misinformation: "Misinformation",
      nsfw: "NSFW",
      off_topic: "Off Topic",
      self_harm: "Self Harm",
      violence: "Violence",
      other: "Other",
    };

    for (const modUserId of modUserIds) {
      await insertNotification(ctx, {
        recipientId: modUserId,
        actorId: userId,
        type: "mod_action",
        targetType: args.targetType === "user" ? "user" : args.targetType,
        targetId: args.targetId,
        title: "New Report",
        message: `${reporterName} reported a ${args.targetType} for ${reasonLabels[args.reason] ?? args.reason}`,
      });
    }

    return reportId;
  },
});

// ============================================================================
// Mutations — Moderation Actions
// ============================================================================

/**
 * Review a report — mark as reviewed/actioned/dismissed with optional action.
 */
export const reviewReport = mutation({
  args: {
    reportId: v.id("reports"),
    action: v.union(
      v.literal("none"),
      v.literal("removed"),
      v.literal("warned"),
      v.literal("banned")
    ),
    modNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: modId } = await requireModerator(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new ConvexError({ code: "NOT_FOUND", message: "Report not found" });

    const now = Date.now();
    const newStatus = args.action === "none" ? "reviewed" : "actioned";

    await ctx.db.patch(args.reportId, {
      status: newStatus,
      reviewedBy: modId,
      reviewedAt: now,
      actionTaken: args.action,
      modNotes: args.modNotes,
      updatedAt: now,
    });

    // Log the review
    await logModAction(ctx, {
      moderatorId: modId,
      targetType: report.targetType,
      targetId: report.targetId,
      action: "approve",
      reason: `Report reviewed: ${args.action}${args.modNotes ? ` — ${args.modNotes}` : ""}`,
      reportId: args.reportId,
    });

    // Notify the reporter that their report was reviewed
    await insertNotification(ctx, {
      recipientId: report.reporterId,
      actorId: modId,
      type: "mod_action",
      targetType: report.targetType,
      targetId: report.targetId,
      title: "Report Reviewed",
      message: `Your report has been reviewed. Action taken: ${args.action === "none" ? "no action needed" : args.action}`,
    });

    return true;
  },
});

/**
 * Dismiss a report as not actionable.
 */
export const dismissReport = mutation({
  args: {
    reportId: v.id("reports"),
    modNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: modId } = await requireModerator(ctx);

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new ConvexError({ code: "NOT_FOUND", message: "Report not found" });

    const now = Date.now();

    await ctx.db.patch(args.reportId, {
      status: "dismissed",
      reviewedBy: modId,
      reviewedAt: now,
      actionTaken: "none",
      modNotes: args.modNotes,
      updatedAt: now,
    });

    await logModAction(ctx, {
      moderatorId: modId,
      targetType: report.targetType,
      targetId: report.targetId,
      action: "approve",
      reason: `Report dismissed${args.modNotes ? `: ${args.modNotes}` : ""}`,
      reportId: args.reportId,
    });

    // Notify reporter
    await insertNotification(ctx, {
      recipientId: report.reporterId,
      actorId: modId,
      type: "mod_action",
      targetType: report.targetType,
      targetId: report.targetId,
      title: "Report Dismissed",
      message: "Your report has been reviewed and dismissed. Thank you for helping keep our community safe.",
    });

    return true;
  },
});

/**
 * Remove content (thread or comment) — soft-delete with reason.
 */
export const removeContent = mutation({
  args: {
    targetType: reportTargetTypeValidator,
    targetId: v.string(),
    reason: v.string(),
    reportId: v.optional(v.id("reports")),
  },
  handler: async (ctx, args) => {
    const { userId: modId } = await requireModerator(ctx);

    const now = Date.now();
    let authorId: Id<"users"> | null = null;

    if (args.targetType === "thread") {
      const thread = await ctx.db.get(args.targetId as Id<"forumThreads">);
      if (!thread) throw new ConvexError({ code: "NOT_FOUND", message: "Thread not found" });
      authorId = thread.authorId;

      await ctx.db.patch(thread._id, {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      });
    } else if (args.targetType === "comment") {
      const comment = await ctx.db.get(args.targetId as Id<"comments">);
      if (!comment) throw new ConvexError({ code: "NOT_FOUND", message: "Comment not found" });
      authorId = comment.authorId;

      await ctx.db.patch(comment._id, {
        isDeleted: true,
        deletedAt: now,
        updatedAt: now,
      });
    }

    // Update report if linked
    if (args.reportId) {
      await ctx.db.patch(args.reportId, {
        status: "actioned",
        reviewedBy: modId,
        reviewedAt: now,
        actionTaken: "removed",
        updatedAt: now,
      });
    }

    await logModAction(ctx, {
      moderatorId: modId,
      targetType: args.targetType,
      targetId: args.targetId,
      action: "remove",
      reason: args.reason,
      reportId: args.reportId,
    });

    // Notify the content author
    if (authorId) {
      await insertNotification(ctx, {
        recipientId: authorId,
        actorId: modId,
        type: "mod_action",
        targetType: args.targetType,
        targetId: args.targetId,
        title: "Content Removed",
        message: `Your ${args.targetType} was removed by a moderator. Reason: ${args.reason}`,
      });
    }

    return true;
  },
});

/**
 * Warn a user — increments warnCount and sends notification.
 */
export const warnUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    reportId: v.optional(v.id("reports")),
  },
  handler: async (ctx, args) => {
    const { userId: modId } = await requireModerator(ctx);

    const now = Date.now();
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        warnCount: (profile.warnCount ?? 0) + 1,
        updatedAt: now,
      });
    }

    // Update report if linked
    if (args.reportId) {
      await ctx.db.patch(args.reportId, {
        status: "actioned",
        reviewedBy: modId,
        reviewedAt: now,
        actionTaken: "warned",
        updatedAt: now,
      });
    }

    await logModAction(ctx, {
      moderatorId: modId,
      targetType: "user",
      targetId: args.userId,
      action: "warn",
      reason: args.reason,
      reportId: args.reportId,
    });

    // Notify the user
    await insertNotification(ctx, {
      recipientId: args.userId,
      actorId: modId,
      type: "mod_action",
      targetType: "user",
      targetId: args.userId,
      title: "Warning",
      message: `You have received a warning from a moderator. Reason: ${args.reason}`,
    });

    return true;
  },
});

/**
 * Ban a user — create a ban record, update profile, and notify.
 */
export const banUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    isPermanent: v.boolean(),
    durationDays: v.optional(v.number()), // For temp bans
    reportId: v.optional(v.id("reports")),
  },
  handler: async (ctx, args) => {
    const { userId: modId, profile: modProfile } = await requireModerator(ctx);

    // Can't ban yourself
    if (args.userId === modId) {
      throw new ConvexError({ code: "INVALID", message: "You cannot ban yourself" });
    }

    // Role hierarchy check — prevent banning users with equal or higher roles
    const targetProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (targetProfile?.defaultRole === "admin") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot ban administrators" });
    }
    if (targetProfile?.defaultRole === "moderator" && modProfile.defaultRole !== "admin") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Only admins can ban other moderators" });
    }

    // Check if already banned
    const alreadyBanned = await isUserBanned(ctx, args.userId);
    if (alreadyBanned) {
      throw new ConvexError({ code: "DUPLICATE", message: "User is already banned" });
    }

    const now = Date.now();
    const expiresAt = !args.isPermanent && args.durationDays
      ? now + args.durationDays * 86400000
      : undefined;

    // Create ban record
    await ctx.db.insert("userBans", {
      userId: args.userId,
      bannedBy: modId,
      reason: args.reason,
      isPermanent: args.isPermanent,
      expiresAt,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Update user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isBanned: true,
        bannedAt: now,
        bannedReason: args.reason,
        updatedAt: now,
      });
    }

    // Update report if linked
    if (args.reportId) {
      await ctx.db.patch(args.reportId, {
        status: "actioned",
        reviewedBy: modId,
        reviewedAt: now,
        actionTaken: "banned",
        updatedAt: now,
      });
    }

    await logModAction(ctx, {
      moderatorId: modId,
      targetType: "user",
      targetId: args.userId,
      action: "ban",
      reason: `${args.isPermanent ? "Permanent" : `${args.durationDays ?? 0} day`} ban: ${args.reason}`,
      reportId: args.reportId,
    });

    // Notify the user
    await insertNotification(ctx, {
      recipientId: args.userId,
      actorId: modId,
      type: "mod_action",
      targetType: "user",
      targetId: args.userId,
      title: "Account Banned",
      message: args.isPermanent
        ? `Your account has been permanently banned. Reason: ${args.reason}`
        : `Your account has been banned for ${args.durationDays ?? 0} days. Reason: ${args.reason}`,
    });

    return true;
  },
});

/**
 * Unban a user — deactivate ban and update profile.
 */
export const unbanUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId: modId } = await requireModerator(ctx);

    const now = Date.now();

    // Find active ban
    const activeBan = await ctx.db
      .query("userBans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .first();

    if (activeBan) {
      await ctx.db.patch(activeBan._id, {
        isActive: false,
        updatedAt: now,
      });
    }

    // Update profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isBanned: false,
        bannedAt: undefined,
        bannedReason: undefined,
        updatedAt: now,
      });
    }

    await logModAction(ctx, {
      moderatorId: modId,
      targetType: "user",
      targetId: args.userId,
      action: "unban",
      reason: args.reason ?? "Ban lifted",
    });

    // Notify the user
    await insertNotification(ctx, {
      recipientId: args.userId,
      actorId: modId,
      type: "mod_action",
      targetType: "user",
      targetId: args.userId,
      title: "Ban Lifted",
      message: "Your ban has been lifted. Please follow community guidelines going forward.",
    });

    return true;
  },
});

/**
 * Mute a user — prevent posting for a duration.
 */
export const muteUser = mutation({
  args: {
    userId: v.id("users"),
    durationHours: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId: modId } = await requireModerator(ctx);

    const now = Date.now();
    const mutedUntil = now + args.durationHours * 3600000;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        isMuted: true,
        mutedUntil,
        updatedAt: now,
      });
    }

    await logModAction(ctx, {
      moderatorId: modId,
      targetType: "user",
      targetId: args.userId,
      action: "mute",
      reason: `${args.durationHours}h mute: ${args.reason}`,
    });

    await insertNotification(ctx, {
      recipientId: args.userId,
      actorId: modId,
      type: "mod_action",
      targetType: "user",
      targetId: args.userId,
      title: "Account Muted",
      message: `You have been muted for ${args.durationHours} hours. Reason: ${args.reason}`,
    });

    return true;
  },
});

// ============================================================================
// Exported helpers for use in forum.ts / comments.ts
// ============================================================================

/**
 * Check if user is banned — throws ConvexError if banned.
 * Call this at the top of any content-creation mutation.
 */
export async function checkBanStatus(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const banned = await isUserBanned(ctx, userId);
  if (banned) {
    throw new ConvexError({
      code: "BANNED",
      message: "You are banned from posting. Contact support if you believe this is an error.",
    });
  }
}

/**
 * Check if user is muted — throws ConvexError if muted.
 * Call this at the top of any content-creation mutation.
 */
export async function checkMuteStatus(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const muted = await isUserMuted(ctx, userId);
  if (muted) {
    throw new ConvexError({
      code: "MUTED",
      message: "You are temporarily muted and cannot post. Please try again later.",
    });
  }
}
