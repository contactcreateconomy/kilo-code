import { query, mutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { productStatusValidator } from "../schema";
import { createError, ErrorCode } from "../lib/errors";
import { PRODUCT_LIMITS, SLUG_PATTERN } from "../lib/constants";
import { authenticatedMutation, sellerMutation } from "../lib/middleware";

// Domain modules
import {
  getProductById as repoGetProductById,
  getProductBySlug as repoGetProductBySlug,
  getPrimaryImage,
  getProductImages,
  insertProductImage,
} from "../lib/products/products.repository";
import { assertProductOwnership } from "../lib/products/products.policies";
import {
  validateProductSlug,
  validateSlugUniqueness,
  validateProductPrice,
} from "../lib/products/products.service";

/**
 * Product Management Functions
 *
 * Queries and mutations for managing products in the Createconomy marketplace.
 * Includes listing, searching, creating, updating, and deleting products.
 */

// ============================================================================
// Queries
// ============================================================================

export const listProducts = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.optional(v.id("productCategories")),
    status: v.optional(productStatusValidator),
    sellerId: v.optional(v.id("users")),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    includeDetails: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_deleted", (q) => q.eq("isDeleted", false));

    if (args.tenantId && args.status) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_tenant_status", (q) =>
          q.eq("tenantId", args.tenantId).eq("status", args.status!)
        );
    } else if (args.sellerId && args.status) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_seller_status", (q) =>
          q.eq("sellerId", args.sellerId!).eq("status", args.status!)
        );
    } else if (args.categoryId) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId));
    } else if (args.sellerId) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId!));
    } else if (args.tenantId) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    }

    const products = await productsQuery
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit + 1);

    const hasMore = products.length > limit;
    const items = hasMore ? products.slice(0, limit) : products;

    const productsWithDetails = await Promise.all(
      items.map(async (product) => {
        const primaryImage = await getPrimaryImage(ctx, product._id);

        let sellerName: string | null = null;
        let categoryName: string | null = null;

        if (args.includeDetails) {
          const seller = await ctx.db.get(product.sellerId) as {
            _id: Id<"users">;
            name?: string;
          } | null;
          sellerName = seller?.name ?? null;

          if (product.categoryId) {
            const category = await ctx.db.get(product.categoryId) as {
              _id: Id<"productCategories">;
              name: string;
            } | null;
            categoryName = category?.name ?? null;
          }
        }

        return {
          ...product,
          primaryImage: primaryImage?.url,
          ...(args.includeDetails
            ? { sellerName, categoryName }
            : {}),
        };
      })
    );

    return {
      items: productsWithDetails,
      hasMore,
      nextCursor: hasMore && items.length > 0 ? items[items.length - 1]!._id : null,
    };
  },
});

export const getProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductById(ctx, args.productId);
    if (!product || product.isDeleted) {
      return null;
    }

    const images = await getProductImages(ctx, args.productId);

    const seller = await ctx.db.get(product.sellerId);
    const sellerProfile = seller
      ? await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", seller._id))
          .first()
      : null;

    const category = product.categoryId
      ? await ctx.db.get(product.categoryId)
      : null;

    return {
      ...product,
      images: images.sort((a, b) => a.sortOrder - b.sortOrder),
      seller: seller
        ? {
            id: seller._id,
            name: seller.name,
            displayName: sellerProfile?.displayName,
            avatarUrl: sellerProfile?.avatarUrl,
          }
        : null,
      category: category
        ? {
            id: category._id,
            name: category.name,
            slug: category.slug,
          }
        : null,
    };
  },
});

export const getProductBySlug = query({
  args: {
    slug: v.string(),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductBySlug(ctx, args.slug, args.tenantId);
    if (!product || product.isDeleted) {
      return null;
    }

    const images = await getProductImages(ctx, product._id);

    return {
      ...product,
      images: images.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  },
});

export const getProductsByCategory = query({
  args: {
    categoryId: v.id("productCategories"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("status"), "active")
        )
      )
      .take(limit);

    return products;
  },
});

export const getProductsBySeller = query({
  args: {
    sellerId: v.id("users"),
    status: v.optional(productStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let productsQuery;

    if (args.status) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_seller_status", (q) =>
          q.eq("sellerId", args.sellerId).eq("status", args.status!)
        );
    } else {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId));
    }

    const products = await productsQuery
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .take(limit);

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const primaryImage = await getPrimaryImage(ctx, product._id);
        return {
          ...product,
          primaryImage: primaryImage?.url,
        };
      })
    );

    return productsWithImages;
  },
});

export const searchProducts = query({
  args: {
    query: v.string(),
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.optional(v.id("productCategories")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let searchQuery = ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) => {
        let search = q.search("name", args.query);
        if (args.tenantId) {
          search = search.eq("tenantId", args.tenantId);
        }
        if (args.categoryId) {
          search = search.eq("categoryId", args.categoryId);
        }
        search = search.eq("status", "active").eq("isDeleted", false);
        return search;
      });

    const products = await searchQuery.take(limit);

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const primaryImage = await getPrimaryImage(ctx, product._id);
        return {
          ...product,
          primaryImage: primaryImage?.url,
        };
      })
    );

    return productsWithImages;
  },
});

// ============================================================================
// Mutations
// ============================================================================

export const createProduct = sellerMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    currency: v.string(),
    sku: v.optional(v.string()),
    inventory: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
    categoryId: v.optional(v.id("productCategories")),
    tenantId: v.optional(v.id("tenants")),
    isDigital: v.optional(v.boolean()),
    digitalFileUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          altText: v.optional(v.string()),
          isPrimary: v.optional(v.boolean()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // Validate slug format
    validateProductSlug(args.slug);

    // Validate slug uniqueness
    const existingBySlug = await repoGetProductBySlug(ctx, args.slug, args.tenantId);
    validateSlugUniqueness(existingBySlug, args.slug, !!args.tenantId);

    // Validate price range
    validateProductPrice(args.price);

    const now = Date.now();

    const productId = await ctx.db.insert("products", {
      tenantId: args.tenantId,
      sellerId: ctx.userId,
      categoryId: args.categoryId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      shortDescription: args.shortDescription,
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      currency: args.currency,
      sku: args.sku,
      inventory: args.inventory,
      trackInventory: args.trackInventory ?? false,
      status: "draft",
      isDigital: args.isDigital ?? false,
      digitalFileUrl: args.digitalFileUrl,
      tags: args.tags,
      reviewCount: 0,
      salesCount: 0,
      viewCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    if (args.images && args.images.length > 0) {
      for (let i = 0; i < args.images.length; i++) {
        const image = args.images[i]!;
        await insertProductImage(ctx, {
          productId,
          url: image.url,
          altText: image.altText,
          sortOrder: i,
          isPrimary: image.isPrimary ?? i === 0,
          createdAt: now,
        });
      }
    }

    return productId;
  },
});

export const updateProduct = authenticatedMutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    sku: v.optional(v.string()),
    inventory: v.optional(v.number()),
    trackInventory: v.optional(v.boolean()),
    categoryId: v.optional(v.id("productCategories")),
    status: v.optional(productStatusValidator),
    isDigital: v.optional(v.boolean()),
    digitalFileUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductById(ctx, args.productId);
    if (!product) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    await assertProductOwnership(ctx, product.sellerId, ctx.userId, "update this product");

    if (args.price !== undefined && args.price < 0) {
      throw createError(ErrorCode.INVALID_INPUT, "Price must be non-negative", { field: "price" });
    }

    const { productId: _productId, ...updates } = args;

    await ctx.db.patch(args.productId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const deleteProduct = authenticatedMutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductById(ctx, args.productId);
    if (!product) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    await assertProductOwnership(ctx, product.sellerId, ctx.userId, "delete this product");

    await ctx.db.patch(args.productId, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return true;
  },
});

export const addProductImages = authenticatedMutation({
  args: {
    productId: v.id("products"),
    images: v.array(
      v.object({
        url: v.string(),
        altText: v.optional(v.string()),
        isPrimary: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductById(ctx, args.productId);
    if (!product) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    await assertProductOwnership(ctx, product.sellerId, ctx.userId, "add images to this product");

    const existingImages = await getProductImages(ctx, args.productId);

    const maxSortOrder = existingImages.reduce(
      (max, img) => Math.max(max, img.sortOrder),
      -1
    );

    const now = Date.now();

    const hasPrimary = args.images.some((img) => img.isPrimary);
    if (hasPrimary) {
      for (const img of existingImages) {
        if (img.isPrimary) {
          await ctx.db.patch(img._id, { isPrimary: false });
        }
      }
    }

    for (let i = 0; i < args.images.length; i++) {
      const image = args.images[i]!;
      await insertProductImage(ctx, {
        productId: args.productId,
        url: image.url,
        altText: image.altText,
        sortOrder: maxSortOrder + 1 + i,
        isPrimary: image.isPrimary ?? false,
        createdAt: now,
      });
    }

    return true;
  },
});

export const removeProductImage = authenticatedMutation({
  args: {
    imageId: v.id("productImages"),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw createError(ErrorCode.NOT_FOUND, "Image not found");
    }

    const product = await repoGetProductById(ctx, image.productId);
    if (!product) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    await assertProductOwnership(ctx, product.sellerId, ctx.userId, "remove images from this product");

    await ctx.db.delete(args.imageId);

    return true;
  },
});

export const incrementViewCount = mutation({
  args: {
    productId: v.id("products"),
    viewerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductById(ctx, args.productId);
    if (!product || product.isDeleted) {
      return;
    }

    const now = Date.now();
    const VIEW_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

    if (args.viewerId) {
      const recentView = await ctx.db
        .query("productViews")
        .withIndex("by_product_viewer", (q) =>
          q.eq("productId", args.productId).eq("viewerId", args.viewerId!)
        )
        .first();

      if (recentView && now - recentView.viewedAt < VIEW_THROTTLE_MS) {
        return;
      }

      if (recentView) {
        await ctx.db.patch(recentView._id, { viewedAt: now });
      } else {
        await ctx.db.insert("productViews", {
          productId: args.productId,
          viewerId: args.viewerId!,
          viewedAt: now,
        });
      }
    }

    await ctx.db.patch(args.productId, {
      viewCount: product.viewCount + 1,
    });
  },
});

// ============================================================================
// Internal Queries
// ============================================================================

export const getProductById = internalQuery({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await repoGetProductById(ctx, args.productId);
    if (!product || product.isDeleted) {
      return null;
    }

    const images = await getProductImages(ctx, args.productId);

    return {
      ...product,
      images: images.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url),
    };
  },
});
