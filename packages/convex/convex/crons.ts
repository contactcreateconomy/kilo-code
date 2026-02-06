/**
 * Convex Cron Jobs
 *
 * Defines periodic background tasks that run automatically on a schedule.
 * Cron jobs are registered with the Convex runtime and execute the specified
 * internal functions at the configured intervals.
 *
 * @see https://docs.convex.dev/scheduling/cron-jobs
 * @module
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ============================================================================
// Session Cleanup
// ============================================================================

/**
 * A4: Automatically clean up expired sessions every hour.
 *
 * Calls the batched `cleanupExpiredSessionsInternal` mutation which processes
 * up to 100 expired sessions per invocation. If there are more expired sessions
 * than the batch size, the remaining ones will be cleaned up on the next hourly
 * run. This prevents unbounded memory/time usage per invocation while ensuring
 * expired sessions are eventually cleaned up.
 *
 * Previously, `cleanupExpiredSessions` was a public mutation that had to be
 * called externally with no guarantee it would run. This cron job ensures
 * regular automatic execution.
 */
crons.interval(
  "cleanup expired sessions",
  { hours: 1 },
  internal.auth.cleanupExpiredSessionsInternal
);

// ============================================================================
// Soft-Delete Cleanup
// ============================================================================

/**
 * A6: Permanently remove old soft-deleted records once per day.
 *
 * Calls `cleanupSoftDeletedRecords` which processes up to 100 records per
 * invocation across five tables (products, reviews, forumThreads, forumPosts,
 * forumComments). Records must have been soft-deleted more than 30 days ago
 * (based on `deletedAt` or `updatedAt` as fallback).
 *
 * Runs daily because soft-deleted records are not as time-sensitive as expired
 * sessions. If the batch limit is reached, remaining records will be cleaned
 * up on the next daily run.
 */
crons.interval(
  "cleanup soft-deleted records",
  { hours: 24 },
  internal.lib.cleanup.cleanupSoftDeletedRecords
);

export default crons;
