/**
 * Shared Authorization Helpers
 *
 * Reusable authorization predicates that compose with `lib/policies.ts`.
 * Replaces ~15 inline "is owner or mod/admin" checks across function files.
 */

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { createError, ErrorCode } from "../errors";

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

/**
 * Resolve a user's role from their profile.
 * Returns "customer" when no profile exists.
 */
export async function getUserRole(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<string> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return profile?.defaultRole ?? "customer";
}

/**
 * Check whether a user holds a moderator or admin role.
 */
export async function isModOrAdmin(
  ctx: ReadCtx,
  userId: Id<"users">
): Promise<boolean> {
  const role = await getUserRole(ctx, userId);
  return role === "admin" || role === "moderator";
}

/**
 * Assert that the acting user is either the resource owner or a mod/admin.
 *
 * @param resourceOwnerId - The user ID that owns the resource
 * @param actorId - The user performing the action
 * @param actionLabel - Human-readable label for the error message (e.g. "update this thread")
 * @throws ConvexError with FORBIDDEN code if check fails
 */
export async function requireOwnerOrModAdmin(
  ctx: ReadCtx,
  resourceOwnerId: Id<"users">,
  actorId: Id<"users">,
  actionLabel: string
): Promise<void> {
  if (resourceOwnerId === actorId) return;
  if (await isModOrAdmin(ctx, actorId)) return;
  throw createError(ErrorCode.FORBIDDEN, `Not authorized to ${actionLabel}`);
}

/**
 * Assert that the acting user is either the resource owner or an admin.
 *
 * @param resourceOwnerId - The user ID that owns the resource
 * @param actorId - The user performing the action
 * @param actionLabel - Human-readable label for the error message
 * @throws ConvexError with FORBIDDEN code if check fails
 */
export async function requireOwnerOrAdmin(
  ctx: ReadCtx,
  resourceOwnerId: Id<"users">,
  actorId: Id<"users">,
  actionLabel: string
): Promise<void> {
  if (resourceOwnerId === actorId) return;
  const role = await getUserRole(ctx, actorId);
  if (role === "admin") return;
  throw createError(ErrorCode.FORBIDDEN, `Not authorized to ${actionLabel}`);
}

/**
 * Assert that the acting user has an admin role within a specific tenant.
 *
 * @throws ConvexError with FORBIDDEN code if not tenant admin
 */
export async function requireTenantAdmin(
  ctx: ReadCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
): Promise<void> {
  const userTenant = await ctx.db
    .query("userTenants")
    .withIndex("by_user_tenant", (q) =>
      q.eq("userId", userId).eq("tenantId", tenantId)
    )
    .first();

  if (!userTenant || userTenant.role !== "admin") {
    throw createError(
      ErrorCode.FORBIDDEN,
      "Admin role required for this tenant"
    );
  }
}
