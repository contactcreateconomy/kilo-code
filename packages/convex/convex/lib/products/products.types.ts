/**
 * Products Domain Types
 *
 * Central type definitions for the products domain.
 */

import type { Doc, Id } from "../../_generated/dataModel";

/** Product with its primary image URL resolved. */
export interface ProductWithImage extends Doc<"products"> {
  primaryImage?: string;
}

/** Product detail enriched with seller, category, and all images. */
export interface ProductDetail extends Doc<"products"> {
  images: Doc<"productImages">[];
  seller: {
    id: Id<"users">;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
  } | null;
  category: {
    id: Id<"productCategories">;
    name: string;
    slug: string;
  } | null;
}

/** Lightweight search result with primary image. */
export interface ProductSearchResult extends Doc<"products"> {
  primaryImage?: string;
}
