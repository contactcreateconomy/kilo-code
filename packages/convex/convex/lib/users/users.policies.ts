/**
 * Users Domain Policies
 *
 * Authorization predicates for user/tenant resources.
 */

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";
import { requireTenantAdmin } from "../shared/authorization";

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

/**
 * Assert the user is an admin for the given tenant.
 */
export async function assertTenantAdmin(
  ctx: ReadCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
): Promise<void> {
  await requireTenantAdmin(ctx, userId, tenantId);
}
