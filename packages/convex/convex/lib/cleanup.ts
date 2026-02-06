/**
 * Soft-Delete Cleanup Utilities
 *
 * Provides internal mutations for permanently removing old soft-deleted records.
 * Called by the daily cron job defined in `crons.ts`.
 *
 * ## Strategy
 *
 * Multiple tables use an `isDeleted` soft-delete flag. Over time, these records
 * accumulate and waste storage. This module permanently deletes soft-deleted
 * records that are older than the configured retention period (default: 30 days).
 *
 * ## Tables Cleaned
 *
 * | Table           | Has `isDeleted` | Has `deletedAt` | Index Used      |
 * |-----------------|-----------------|-----------------|-----------------|
 * | products        | ✅              | ✅              | by_deleted      |
 * | reviews         | ✅              | ✅              | by_deleted      |
 * | forumThreads    | ✅              | ✅              | by_deleted      |
 * | forumPosts      | ✅              | ✅              | by_deleted      |
 * | forumComments   | ✅              | ✅              | by_deleted      |
 *
 * All five tables have a `deletedAt` timestamp set when the record is soft-deleted.
 * The cleanup uses `deletedAt` to determine age. If `deletedAt` is missing on an
 * old record (e.g. due to a bug or legacy data), the `updatedAt` field is used
 * as a fallback approximation.
 *
 * ## Batching
 *
 * Each invocation processes up to `SOFT_DELETE_CLEANUP.BATCH_SIZE` records (100)
 * across ALL tables combined. If more records remain, `hasMore: true` is returned
 * and the next cron invocation will continue. This prevents unbounded execution
 * time per cron tick.
 *
 * @module
 */

import { internalMutation } from "../_generated/server";
import { SOFT_DELETE_CLEANUP } from "./constants";

/**
 * Permanently delete old soft-deleted records across all tables.
 *
 * Called by the daily cron job. Processes records in batches to avoid
 * exceeding Convex mutation time limits.
 *
 * @returns `{ deleted: number, hasMore: boolean }` — total records deleted
 *   in this invocation and whether more remain for the next run.
 */
export const cleanupSoftDeletedRecords = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ deleted: number; hasMore: boolean }> => {
    const cutoffMs =
      Date.now() - SOFT_DELETE_CLEANUP.RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const batchSize = SOFT_DELETE_CLEANUP.BATCH_SIZE;

    let totalDeleted = 0;
    let hasMore = false;

    // Helper: determines the effective deletion timestamp for a record.
    // Prefers `deletedAt`; falls back to `updatedAt` for legacy records.
    const getEffectiveDeletedAt = (
      record: { deletedAt?: number; updatedAt: number }
    ): number => record.deletedAt ?? record.updatedAt;

    // ---- products ----
    if (totalDeleted < batchSize) {
      const remaining = batchSize - totalDeleted;
      const products = await ctx.db
        .query("products")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", true))
        .take(remaining + 1);

      const toDelete = products
        .filter((p) => getEffectiveDeletedAt(p) < cutoffMs)
        .slice(0, remaining);

      for (const product of toDelete) {
        // Also delete associated product images to avoid orphaned records
        const images = await ctx.db
          .query("productImages")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .collect();
        for (const image of images) {
          await ctx.db.delete(image._id);
        }
        await ctx.db.delete(product._id);
        totalDeleted++;
      }

      if (products.length > remaining) {
        hasMore = true;
      }
    }

    // ---- reviews ----
    if (totalDeleted < batchSize) {
      const remaining = batchSize - totalDeleted;
      const reviews = await ctx.db
        .query("reviews")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", true))
        .take(remaining + 1);

      const toDelete = reviews
        .filter((r) => getEffectiveDeletedAt(r) < cutoffMs)
        .slice(0, remaining);

      for (const review of toDelete) {
        await ctx.db.delete(review._id);
        totalDeleted++;
      }

      if (reviews.length > remaining) {
        hasMore = true;
      }
    }

    // ---- forumThreads ----
    if (totalDeleted < batchSize) {
      const remaining = batchSize - totalDeleted;
      const threads = await ctx.db
        .query("forumThreads")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", true))
        .take(remaining + 1);

      const toDelete = threads
        .filter((t) => getEffectiveDeletedAt(t) < cutoffMs)
        .slice(0, remaining);

      for (const thread of toDelete) {
        await ctx.db.delete(thread._id);
        totalDeleted++;
      }

      if (threads.length > remaining) {
        hasMore = true;
      }
    }

    // ---- forumPosts ----
    if (totalDeleted < batchSize) {
      const remaining = batchSize - totalDeleted;
      const posts = await ctx.db
        .query("forumPosts")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", true))
        .take(remaining + 1);

      const toDelete = posts
        .filter((p) => getEffectiveDeletedAt(p) < cutoffMs)
        .slice(0, remaining);

      for (const post of toDelete) {
        await ctx.db.delete(post._id);
        totalDeleted++;
      }

      if (posts.length > remaining) {
        hasMore = true;
      }
    }

    // ---- forumComments ----
    if (totalDeleted < batchSize) {
      const remaining = batchSize - totalDeleted;
      const comments = await ctx.db
        .query("forumComments")
        .withIndex("by_deleted", (q) => q.eq("isDeleted", true))
        .take(remaining + 1);

      const toDelete = comments
        .filter((c) => getEffectiveDeletedAt(c) < cutoffMs)
        .slice(0, remaining);

      for (const comment of toDelete) {
        await ctx.db.delete(comment._id);
        totalDeleted++;
      }

      if (comments.length > remaining) {
        hasMore = true;
      }
    }

    return { deleted: totalDeleted, hasMore };
  },
});
