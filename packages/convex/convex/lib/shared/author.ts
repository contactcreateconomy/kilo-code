/**
 * Shared Author Enrichment
 *
 * Centralizes the repeated pattern of fetching a user + their profile
 * to produce an `AuthorInfo` object. Replaces 15+ inline instances
 * across forum.ts, products.ts, and users.ts.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

/** Normalized author information returned to clients. */
export interface AuthorInfo {
  id: Id<"users">;
  name: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
}

/**
 * Enrich a single user ID into an AuthorInfo object.
 *
 * Returns `null` when the user document doesn't exist.
 */
export async function enrichAuthor(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<AuthorInfo | null> {
  const user = await ctx.db.get(userId);
  if (!user) return null;

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  return {
    id: user._id,
    name: profile?.displayName ?? user.name ?? "Anonymous",
    displayName: profile?.displayName,
    username: profile?.username ?? String(user._id),
    avatarUrl: profile?.avatarUrl ?? undefined,
    role: profile?.defaultRole,
  };
}

/**
 * Enrich a batch of user IDs into AuthorInfo objects.
 *
 * Deduplicates user IDs so each is fetched at most once.
 * Returns a Map keyed by user ID for O(1) lookup.
 */
export async function enrichAuthorBatch(
  ctx: ReadCtx,
  userIds: Id<"users">[]
): Promise<Map<Id<"users">, AuthorInfo | null>> {
  const unique = [...new Set(userIds)];
  const results = await Promise.all(
    unique.map(async (uid) => {
      const info = await enrichAuthor(ctx, uid);
      return [uid, info] as const;
    })
  );
  return new Map(results);
}
