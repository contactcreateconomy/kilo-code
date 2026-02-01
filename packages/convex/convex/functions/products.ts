import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";
import { productStatusValidator } from "../schema";

/**
 * Product Management Functions
 *
 * Queries and mutations for managing products in the Createconomy marketplace.
 * Includes listing, searching, creating, updating, and deleting products.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * List products with pagination and filters
 *
 * @param tenantId - Optional tenant filter
 * @param categoryId - Optional category filter
 * @param status - Optional status filter
 * @param sellerId - Optional seller filter
 * @param cursor - Pagination cursor
 * @param limit - Number of items per page
 * @returns Paginated list of products
 */
export const listProducts = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
    categoryId: v.optional(v.id("productCategories")),
    status: v.optional(productStatusValidator),
    sellerId: v.optional(v.id("users")),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_deleted", (q) => q.eq("isDeleted", false));

    // Apply filters based on available indexes
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

    // Get primary images for each product
    const productsWithImages = await Promise.all(
      items.map(async (product) => {
        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

        return {
          ...product,
          primaryImage: primaryImage?.url,
        };
      })
    );

    return {
      items: productsWithImages,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});

/**
 * Get a single product by ID
 *
 * @param productId - Product ID
 * @returns Product with images and seller info
 */
export const getProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      return null;
    }

    // Get all images
    const images = await ctx.db
      .query("productImages")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    // Get seller info
    const seller = await ctx.db.get(product.sellerId);
    const sellerProfile = seller
      ? await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", seller._id))
          .first()
      : null;

    // Get category
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

/**
 * Get product by slug
 *
 * @param slug - Product slug
 * @param tenantId - Optional tenant ID for scoped lookup
 * @returns Product or null
 */
export const getProductBySlug = query({
  args: {
    slug: v.string(),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    let product;

    if (args.tenantId) {
      product = await ctx.db
        .query("products")
        .withIndex("by_tenant_slug", (q) =>
          q.eq("tenantId", args.tenantId).eq("slug", args.slug)
        )
        .first();
    } else {
      product = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
    }

    if (!product || product.isDeleted) {
      return null;
    }

    // Get images
    const images = await ctx.db
      .query("productImages")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();

    return {
      ...product,
      images: images.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  },
});

/**
 * Get products by category
 *
 * @param categoryId - Category ID
 * @param limit - Number of products to return
 * @returns List of products in the category
 */
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

/**
 * Get products by seller
 *
 * @param sellerId - Seller user ID
 * @param status - Optional status filter
 * @param limit - Number of products to return
 * @returns List of seller's products
 */
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

    // Get primary images
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

        return {
          ...product,
          primaryImage: primaryImage?.url,
        };
      })
    );

    return productsWithImages;
  },
});

/**
 * Search products by name
 *
 * @param query - Search query
 * @param tenantId - Optional tenant filter
 * @param categoryId - Optional category filter
 * @param limit - Number of results
 * @returns Search results
 */
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

    // Get primary images
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

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

/**
 * Create a new product (seller only)
 *
 * @param name - Product name
 * @param description - Product description
 * @param price - Product price
 * @param currency - Currency code
 * @param categoryId - Category ID
 * @param tenantId - Tenant ID
 * @param images - Array of image URLs
 * @returns Created product ID
 */
export const createProduct = mutation({
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user is a seller
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || (profile.defaultRole !== "seller" && profile.defaultRole !== "admin")) {
      throw new Error("Seller role required");
    }

    // Validate price
    if (args.price < 0) {
      throw new Error("Price must be non-negative");
    }

    const now = Date.now();

    // Create product
    const productId = await ctx.db.insert("products", {
      tenantId: args.tenantId,
      sellerId: userId,
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

    // Create images
    if (args.images && args.images.length > 0) {
      for (let i = 0; i < args.images.length; i++) {
        const image = args.images[i];
        await ctx.db.insert("productImages", {
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

/**
 * Update a product (seller only, own products)
 *
 * @param productId - Product ID
 * @param updates - Fields to update
 * @returns Success boolean
 */
export const updateProduct = mutation({
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check ownership or admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (product.sellerId !== userId && profile?.defaultRole !== "admin") {
      throw new Error("Not authorized to update this product");
    }

    // Validate price if provided
    if (args.price !== undefined && args.price < 0) {
      throw new Error("Price must be non-negative");
    }

    const { productId, ...updates } = args;

    await ctx.db.patch(args.productId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete a product (soft delete)
 *
 * @param productId - Product ID
 * @returns Success boolean
 */
export const deleteProduct = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check ownership or admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (product.sellerId !== userId && profile?.defaultRole !== "admin") {
      throw new Error("Not authorized to delete this product");
    }

    await ctx.db.patch(args.productId, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Add images to a product
 *
 * @param productId - Product ID
 * @param images - Array of images to add
 * @returns Success boolean
 */
export const addProductImages = mutation({
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check ownership
    if (product.sellerId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw new Error("Not authorized");
      }
    }

    // Get current max sort order
    const existingImages = await ctx.db
      .query("productImages")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();

    const maxSortOrder = existingImages.reduce(
      (max, img) => Math.max(max, img.sortOrder),
      -1
    );

    const now = Date.now();

    // If setting a new primary, unset existing primary
    const hasPrimary = args.images.some((img) => img.isPrimary);
    if (hasPrimary) {
      for (const img of existingImages) {
        if (img.isPrimary) {
          await ctx.db.patch(img._id, { isPrimary: false });
        }
      }
    }

    // Add new images
    for (let i = 0; i < args.images.length; i++) {
      const image = args.images[i];
      await ctx.db.insert("productImages", {
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

/**
 * Remove an image from a product
 *
 * @param imageId - Image ID
 * @returns Success boolean
 */
export const removeProductImage = mutation({
  args: {
    imageId: v.id("productImages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    const product = await ctx.db.get(image.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check ownership
    if (product.sellerId !== userId) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile?.defaultRole !== "admin") {
        throw new Error("Not authorized");
      }
    }

    await ctx.db.delete(args.imageId);

    return true;
  },
});

/**
 * Increment product view count
 *
 * @param productId - Product ID
 */
export const incrementViewCount = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      return;
    }

    await ctx.db.patch(args.productId, {
      viewCount: product.viewCount + 1,
    });
  },
});
