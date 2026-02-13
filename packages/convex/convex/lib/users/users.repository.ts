/**
 * Users Repository
 *
 * Database access patterns for the users domain.
 * Replaces 10+ inline profile-by-user lookups.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";

type ReadCtx = Pick<QueryCtx, "db">;
type WriteCtx = Pick<MutationCtx, "db">;

// ---------------------------------------------------------------------------
// Profile reads
// ---------------------------------------------------------------------------

/** Fetch a user's profile by their user ID. */
export async function getProfileByUserId(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<Doc<"userProfiles"> | null> {
  return await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

/** Fetch a seller record by user ID. */
export async function getSellerByUserId(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<Doc<"sellers"> | null> {
  return await ctx.db
    .query("sellers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

// ---------------------------------------------------------------------------
// Profile writes
// ---------------------------------------------------------------------------

/** Upsert (insert or update) a user profile. */
export async function upsertProfile(
  ctx: WriteCtx,
  userId: Id<"users">,
  data: Partial<Doc<"userProfiles">>,
  now: number
): Promise<Id<"userProfiles">> {
  const existing = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      ...data,
      updatedAt: now,
    } as never);
    return existing._id;
  }

  return await ctx.db.insert("userProfiles", {
    userId,
    defaultRole: "customer",
    isBanned: false,
    ...data,
    createdAt: now,
    updatedAt: now,
  } as never);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/** Search profiles by username or display name (in-memory filter). */
export async function searchProfiles(
  ctx: ReadCtx,
  searchTerm: string,
  limit: number = 5
): Promise<Doc<"userProfiles">[]> {
  const search = searchTerm.toLowerCase().trim();
  if (search.length === 0) return [];

  const profiles = await ctx.db
    .query("userProfiles")
    .filter((q) => q.neq(q.field("isBanned"), true))
    .take(200);

  return profiles
    .filter(
      (p) =>
        p.username?.toLowerCase().includes(search) ||
        p.displayName?.toLowerCase().includes(search)
    )
    .slice(0, limit);
}
