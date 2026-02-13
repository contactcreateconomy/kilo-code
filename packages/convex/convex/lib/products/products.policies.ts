/**
 * Products Domain Policies
 *
 * Authorization predicates for product resources.
 * Uses shared `requireOwnerOrAdmin` helper.
 */

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { requireOwnerOrAdmin } from "../shared/authorization";

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

/**
 * Assert that the acting user is the product seller or an admin.
 */
export async function assertProductOwnership(
  ctx: ReadCtx,
  sellerId: Id<"users">,
  actorId: Id<"users">,
  actionLabel: string = "modify this product"
): Promise<void> {
  await requireOwnerOrAdmin(ctx, sellerId, actorId, actionLabel);
}
