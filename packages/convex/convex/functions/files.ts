import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createError, ErrorCode } from "../lib/errors";
import type { Id } from "../_generated/dataModel";

/**
 * Product Files & Downloads Functions
 *
 * Manage digital file attachments for products and track downloads.
 * Gumroad equivalent: Digital product delivery, file management, download tracking.
 */

// ============================================================================
// File Queries
// ============================================================================

/**
 * Get all files for a product.
 * Sellers see all files; buyers see only preview files unless they purchased.
 */
export const getProductFiles = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      return [];
    }

    const files = await ctx.db
      .query("productFiles")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // If user is the seller, return all files
    if (userId && product.sellerId === userId) {
      return files;
    }

    // Check if user has purchased this product
    let hasPurchased = false;
    if (userId) {
      const orders = await ctx.db
        .query("orderItems")
        .withIndex("by_product", (q) => q.eq("productId", args.productId))
        .collect();

      for (const orderItem of orders) {
        const order = await ctx.db.get(orderItem.orderId);
        if (
          order &&
          order.userId === userId &&
          (order.status === "confirmed" ||
            order.status === "delivered" ||
            order.status === "processing" ||
            order.status === "shipped")
        ) {
          hasPurchased = true;
          break;
        }
      }
    }

    // Non-purchasers only see preview files
    if (!hasPurchased) {
      return files
        .filter((f) => f.isPreview)
        .map((f) => ({
          ...f,
          storageId: undefined, // Don't expose storage IDs
          externalUrl: undefined,
        }));
    }

    return files;
  },
});

/**
 * Get file count for a product.
 */
export const getProductFileCount = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const files = await ctx.db
      .query("productFiles")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    return {
      total: files.length,
      previewCount: files.filter((f) => f.isPreview).length,
      deliverableCount: files.filter((f) => !f.isPreview).length,
    };
  },
});

// ============================================================================
// File Mutations
// ============================================================================

/**
 * Add a file to a product (seller only).
 */
export const addProductFile = mutation({
  args: {
    productId: v.id("products"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    storageId: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    isPreview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    if (product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized to modify this product");
    }

    if (!args.storageId && !args.externalUrl) {
      throw createError(
        ErrorCode.INVALID_INPUT,
        "Either storageId or externalUrl must be provided"
      );
    }

    // Get current max sort order
    const existingFiles = await ctx.db
      .query("productFiles")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    const maxSortOrder = existingFiles.reduce(
      (max, f) => Math.max(max, f.sortOrder),
      -1
    );

    const now = Date.now();

    const fileId = await ctx.db.insert("productFiles", {
      productId: args.productId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      storageId: args.storageId,
      externalUrl: args.externalUrl,
      isPreview: args.isPreview ?? false,
      sortOrder: maxSortOrder + 1,
      downloadCount: 0,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    return fileId;
  },
});

/**
 * Update a product file (seller only).
 */
export const updateProductFile = mutation({
  args: {
    fileId: v.id("productFiles"),
    fileName: v.optional(v.string()),
    isPreview: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file || file.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "File not found");
    }

    const product = await ctx.db.get(file.productId);
    if (!product || product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    const { fileId: _fileId, ...updates } = args;

    await ctx.db.patch(args.fileId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete a product file (soft delete, seller only).
 */
export const deleteProductFile = mutation({
  args: {
    fileId: v.id("productFiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file || file.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "File not found");
    }

    const product = await ctx.db.get(file.productId);
    if (!product || product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    await ctx.db.patch(args.fileId, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Reorder product files (seller only).
 */
export const reorderProductFiles = mutation({
  args: {
    productId: v.id("products"),
    fileIds: v.array(v.id("productFiles")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const product = await ctx.db.get(args.productId);
    if (!product || product.sellerId !== userId) {
      throw createError(ErrorCode.UNAUTHORIZED, "Not authorized");
    }

    for (let i = 0; i < args.fileIds.length; i++) {
      await ctx.db.patch(args.fileIds[i]!, {
        sortOrder: i,
        updatedAt: Date.now(),
      });
    }

    return true;
  },
});

// ============================================================================
// Download Queries
// ============================================================================

/**
 * Get the current user's download history.
 */
export const getMyDownloads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    const downloads = await ctx.db
      .query("productDownloads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Enrich with product and file details
    const items = await Promise.all(
      downloads.map(async (dl) => {
        const product = await ctx.db.get(dl.productId);
        const file = await ctx.db.get(dl.productFileId);

        if (!product || product.isDeleted) {
          return null;
        }

        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

        return {
          ...dl,
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            primaryImage: primaryImage?.url,
          },
          file: file
            ? {
                _id: file._id,
                fileName: file.fileName,
                fileSize: file.fileSize,
                mimeType: file.mimeType,
              }
            : null,
        };
      })
    );

    return {
      items: items.filter(Boolean),
    };
  },
});

/**
 * Get purchased products (products the user has bought and can download).
 * This is the "Library" page equivalent from Gumroad.
 */
export const getMyPurchasedProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [] };
    }

    const limit = args.limit ?? 50;

    // Get user's completed orders
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "confirmed"),
          q.eq(q.field("status"), "delivered"),
          q.eq(q.field("status"), "processing"),
          q.eq(q.field("status"), "shipped")
        )
      )
      .order("desc")
      .take(limit);

    // Get all order items from these orders
    const productMap = new Map<
      string,
      {
        productId: Id<"products">;
        orderId: Id<"orders">;
        purchasedAt: number;
      }
    >();

    for (const order of orders) {
      const orderItems = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();

      for (const item of orderItems) {
        const pid = item.productId as unknown as string;
        if (!productMap.has(pid)) {
          productMap.set(pid, {
            productId: item.productId,
            orderId: order._id,
            purchasedAt: order.createdAt,
          });
        }
      }
    }

    // Enrich with product details
    const items = await Promise.all(
      Array.from(productMap.values()).map(async (entry) => {
        const product = await ctx.db.get(entry.productId);
        if (!product || product.isDeleted) {
          return null;
        }

        const primaryImage = await ctx.db
          .query("productImages")
          .withIndex("by_product_primary", (q) =>
            q.eq("productId", product._id).eq("isPrimary", true)
          )
          .first();

        // Get file count
        const files = await ctx.db
          .query("productFiles")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .filter((q) => q.eq(q.field("isDeleted"), false))
          .collect();

        // Get license if any
        const license = await ctx.db
          .query("licenses")
          .withIndex("by_order", (q) =>
            q.eq("orderId", entry.orderId)
          )
          .first();

        return {
          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            currency: product.currency,
            isDigital: product.isDigital,
            primaryImage: primaryImage?.url,
          },
          purchasedAt: entry.purchasedAt,
          fileCount: files.filter((f) => !f.isPreview).length,
          hasLicense: license !== null,
          licenseKey: license?.licenseKey,
        };
      })
    );

    return {
      items: items.filter(Boolean),
    };
  },
});

// ============================================================================
// Download Mutations
// ============================================================================

/**
 * Record a file download (buyer must have purchased the product).
 */
export const recordDownload = mutation({
  args: {
    productFileId: v.id("productFiles"),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHENTICATED, "Authentication required");
    }

    const file = await ctx.db.get(args.productFileId);
    if (!file || file.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "File not found");
    }

    const product = await ctx.db.get(file.productId);
    if (!product || product.isDeleted) {
      throw createError(ErrorCode.NOT_FOUND, "Product not found");
    }

    // Allow sellers to download their own files — just increment count, no download record needed
    if (product.sellerId === userId) {
      await ctx.db.patch(args.productFileId, {
        downloadCount: file.downloadCount + 1,
        updatedAt: Date.now(),
      });

      return args.productFileId; // Return file ID as acknowledgment
    }

    // For buyers, verify purchase
    const orderItems = await ctx.db
      .query("orderItems")
      .withIndex("by_product", (q) => q.eq("productId", file.productId))
      .collect();

    let purchaseOrderId: Id<"orders"> | null = null;
    for (const orderItem of orderItems) {
      const order = await ctx.db.get(orderItem.orderId);
      if (
        order &&
        order.userId === userId &&
        (order.status === "confirmed" ||
          order.status === "delivered" ||
          order.status === "processing" ||
          order.status === "shipped")
      ) {
        purchaseOrderId = order._id;
        break;
      }
    }

    if (!purchaseOrderId) {
      throw createError(ErrorCode.UNAUTHORIZED, "You must purchase this product to download");
    }

    // Check download limits
    if (product.maxDownloads) {
      const existingDownloads = await ctx.db
        .query("productDownloads")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("productId"), file.productId))
        .collect();

      if (existingDownloads.length >= product.maxDownloads) {
        throw createError(
          ErrorCode.RATE_LIMITED,
          `Download limit reached (${product.maxDownloads} downloads maximum)`
        );
      }
    }

    const downloadId = await ctx.db.insert("productDownloads", {
      userId,
      productFileId: args.productFileId,
      productId: file.productId,
      orderId: purchaseOrderId,
      downloadedAt: Date.now(),
      ipAddress: args.ipAddress,
    });

    // Increment download count
    await ctx.db.patch(args.productFileId, {
      downloadCount: file.downloadCount + 1,
      updatedAt: Date.now(),
    });

    return downloadId;
  },
});
