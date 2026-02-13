/**
 * Mapper utilities for converting Convex backend data to frontend display types.
 *
 * Convex returns data with `_id`, `_creationTime`, prices in cents, etc.
 * These mappers transform that data into the `Product`, `Category`, and
 * `Seller` types used by UI components.
 */

import type { Product, Category } from "@/types";
import { centsToDollars } from "@/lib/utils";

// ============================================================================
// Product Mappers
// ============================================================================

/**
 * Convex product shape returned by `listProducts` / `searchProducts`.
 * These functions return product rows with a `primaryImage` URL.
 */
interface ConvexProductListItem {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number; // cents
  compareAtPrice?: number; // cents
  categoryId?: string;
  sellerId: string;
  status: string;
  tags?: string[];
  averageRating?: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  primaryImage?: string;
  createdAt: number;
  updatedAt: number;
  // When includeDetails is true:
  sellerName?: string | null;
  categoryName?: string | null;
}

/**
 * Convex product shape returned by `getProduct` (full detail).
 */
interface ConvexProductDetail {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number; // cents
  compareAtPrice?: number; // cents
  categoryId?: string;
  sellerId: string;
  status: string;
  tags?: string[];
  averageRating?: number;
  reviewCount: number;
  salesCount: number;
  viewCount: number;
  createdAt: number;
  updatedAt: number;
  images: Array<{
    _id: string;
    url: string;
    altText?: string;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  seller: {
    id: string;
    name?: string;
    displayName?: string;
    avatarUrl?: string;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Map a Convex list product item to the frontend `Product` type.
 *
 * For list items, we don't have full seller/category data, so we use
 * placeholder values unless `includeDetails` enrichment is present.
 */
export function mapConvexProductListItem(item: ConvexProductListItem): Product {
  return {
    id: item._id,
    slug: item.slug,
    name: item.name,
    description: item.shortDescription ?? item.description,
    price: centsToDollars(item.price),
    compareAtPrice: item.compareAtPrice
      ? centsToDollars(item.compareAtPrice)
      : undefined,
    images: item.primaryImage ? [item.primaryImage] : [],
    category: {
      id: item.categoryId ?? "",
      name: item.categoryName ?? "",
      slug: "",
    },
    seller: {
      id: item.sellerId,
      name: item.sellerName ?? "Seller",
    },
    rating: item.averageRating ?? 0,
    reviewCount: item.reviewCount,
    salesCount: item.salesCount,
    tags: item.tags,
    createdAt: new Date(item.createdAt).toISOString(),
    updatedAt: new Date(item.updatedAt).toISOString(),
  };
}

/**
 * Map a Convex full product detail to the frontend `Product` type.
 */
export function mapConvexProductDetail(detail: ConvexProductDetail): Product {
  return {
    id: detail._id,
    slug: detail.slug,
    name: detail.name,
    description: detail.description,
    price: centsToDollars(detail.price),
    compareAtPrice: detail.compareAtPrice
      ? centsToDollars(detail.compareAtPrice)
      : undefined,
    images: detail.images.map((img) => img.url),
    category: detail.category
      ? {
          id: detail.category.id,
          name: detail.category.name,
          slug: detail.category.slug,
        }
      : { id: "", name: "", slug: "" },
    seller: detail.seller
      ? {
          id: detail.seller.id,
          name: detail.seller.displayName ?? detail.seller.name ?? "Seller",
          avatar: detail.seller.avatarUrl,
        }
      : { id: "", name: "Unknown Seller" },
    rating: detail.averageRating ?? 0,
    reviewCount: detail.reviewCount,
    salesCount: detail.salesCount,
    tags: detail.tags,
    createdAt: new Date(detail.createdAt).toISOString(),
    updatedAt: new Date(detail.updatedAt).toISOString(),
  };
}

// ============================================================================
// Category Mappers
// ============================================================================

/**
 * Convex category tree node from `listCategories`.
 */
interface ConvexCategoryTreeNode {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  children?: ConvexCategoryTreeNode[];
}

/**
 * Map a Convex category tree node to a frontend `Category`.
 */
export function mapConvexCategory(node: ConvexCategoryTreeNode): Category {
  return {
    id: node._id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    image: node.imageUrl,
    parentId: node.parentId,
  };
}

/**
 * Flatten a tree of Convex categories into a flat list.
 * Useful for filters that need a simple list, not nested structure.
 */
export function flattenCategoryTree(
  tree: ConvexCategoryTreeNode[]
): Category[] {
  const result: Category[] = [];

  function walk(nodes: ConvexCategoryTreeNode[]) {
    for (const node of nodes) {
      result.push(mapConvexCategory(node));
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return result;
}
