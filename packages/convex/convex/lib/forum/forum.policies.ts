/**
 * Forum Domain Policies
 *
 * Authorization predicates specific to forum resources (threads, posts, comments).
 * Composes with `lib/shared/authorization.ts` for owner-or-mod checks.
 */

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { requireOwnerOrModAdmin, isModOrAdmin } from "../shared/authorization";

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

/**
 * Assert the acting user can edit the thread.
 *
 * Title edits require ownership or mod/admin.
 * Pin/lock changes require mod/admin only.
 */
export async function canEditThread(
  ctx: ReadCtx,
  threadAuthorId: Id<"users">,
  actorId: Id<"users">,
  opts: { editingTitle?: boolean; editingModFields?: boolean }
): Promise<void> {
  if (opts.editingTitle) {
    await requireOwnerOrModAdmin(ctx, threadAuthorId, actorId, "update this thread");
  }
  if (opts.editingModFields) {
    const modAdmin = await isModOrAdmin(ctx, actorId);
    if (!modAdmin) {
      const { createError, ErrorCode } = await import("../errors");
      throw createError(ErrorCode.FORBIDDEN, "Moderator role required");
    }
  }
}

/** Assert the acting user can delete the thread. */
export async function canDeleteThread(
  ctx: ReadCtx,
  threadAuthorId: Id<"users">,
  actorId: Id<"users">
): Promise<void> {
  await requireOwnerOrModAdmin(ctx, threadAuthorId, actorId, "delete this thread");
}

/** Assert the acting user can edit the post. */
export async function canEditPost(
  ctx: ReadCtx,
  postAuthorId: Id<"users">,
  actorId: Id<"users">
): Promise<void> {
  await requireOwnerOrModAdmin(ctx, postAuthorId, actorId, "update this post");
}

/** Assert the acting user can delete the post. */
export async function canDeletePost(
  ctx: ReadCtx,
  postAuthorId: Id<"users">,
  actorId: Id<"users">
): Promise<void> {
  await requireOwnerOrModAdmin(ctx, postAuthorId, actorId, "delete this post");
}

/** Assert the acting user can delete the comment. */
export async function canDeleteComment(
  ctx: ReadCtx,
  commentAuthorId: Id<"users">,
  actorId: Id<"users">
): Promise<void> {
  await requireOwnerOrModAdmin(ctx, commentAuthorId, actorId, "delete this comment");
}
