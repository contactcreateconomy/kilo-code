"use client";

import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { ProductGrid } from "./product-grid";

interface CategoryResolverProps {
  categorySlug?: string;
  search?: string;
  sort?: string;
}

/**
 * Client component that resolves a category slug to a Convex category ID,
 * then passes it down to `ProductGrid`.
 *
 * When no `categorySlug` is provided, renders the grid without a category filter.
 */
export function CategoryResolver({
  categorySlug,
  search,
  sort,
}: CategoryResolverProps) {
  // Resolve slug → category only when a slug is provided
  const category = useQuery(
    api.functions.categories.getCategoryBySlug,
    categorySlug ? { slug: categorySlug } : "skip"
  );

  // While resolving, category will be `undefined` — ProductGrid shows skeleton
  const categoryId = category?._id;

  return (
    <ProductGrid
      category={categorySlug}
      categoryId={categoryId}
      search={search}
      sort={sort}
    />
  );
}
