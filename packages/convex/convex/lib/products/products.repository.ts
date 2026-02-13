/**
 * Products Repository
 *
 * Database access patterns for the products domain.
 */

import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx, MutationCtx } from "../../_generated/server";

type ReadCtx = Pick<QueryCtx, "db">;
type WriteCtx = Pick<MutationCtx, "db">;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getProductById(
  ctx: ReadCtx,
  productId: Id<"products">
): Promise<Doc<"products"> | null> {
  return await ctx.db.get(productId);
}

export async function getProductBySlug(
  ctx: ReadCtx,
  slug: string,
  tenantId?: Id<"tenants">
): Promise<Doc<"products"> | null> {
  if (tenantId) {
    return await ctx.db
      .query("products")
      .withIndex("by_tenant_slug", (q) =>
        q.eq("tenantId", tenantId).eq("slug", slug)
      )
      .first();
  }
  return await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
}

export async function getPrimaryImage(
  ctx: ReadCtx,
  productId: Id<"products">
): Promise<Doc<"productImages"> | null> {
  return await ctx.db
    .query("productImages")
    .withIndex("by_product_primary", (q) =>
      q.eq("productId", productId).eq("isPrimary", true)
    )
    .first();
}

export async function getProductImages(
  ctx: ReadCtx,
  productId: Id<"products">
): Promise<Doc<"productImages">[]> {
  return await ctx.db
    .query("productImages")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
}

export async function insertProductImage(
  ctx: WriteCtx,
  data: {
    productId: Id<"products">;
    url: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
    createdAt: number;
  }
): Promise<Id<"productImages">> {
  return await ctx.db.insert("productImages", data);
}
