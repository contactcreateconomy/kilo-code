import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";

/**
 * Category Management Functions
 *
 * Queries and mutations for managing product categories
 * in the Createconomy marketplace.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * List all categories
 *
 * @param tenantId - Optional tenant filter
 * @param includeInactive - Include inactive categories
 * @returns List of categories
 */
export const listCategories = query({
  args: {
    tenantId: v.optional(v.id("tenants")),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let categoriesQuery;

    if (args.tenantId) {
      categoriesQuery = ctx.db
        .query("productCategories")
        .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId));
    } else {
      categoriesQuery = ctx.db.query("productCategories");
    }

    let categories = await categoriesQuery.collect();

    // Filter inactive if not requested
    if (!args.includeInactive) {
      categories = categories.filter((c) => c.isActive);
    }

    // Sort by sortOrder
    categories.sort((a, b) => a.sortOrder - b.sortOrder);

    // Build tree structure
    const rootCategories = categories.filter((c) => !c.parentId);
    const childCategories = categories.filter((c) => c.parentId);

    function buildTree(parent: (typeof categories)[0]): any {
      const children: any[] = childCategories
        .filter((c) => c.parentId === parent._id)
        .map((child) => buildTree(child));

      return {
        ...parent,
        children: children.length > 0 ? children : undefined,
      };
    }

    return rootCategories.map(buildTree);
  },
});

/**
 * Get a single category by ID
 *
 * @param categoryId - Category ID
 * @returns Category with parent and children
 */
export const getCategory = query({
  args: {
    categoryId: v.id("productCategories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      return null;
    }

    // Get parent if exists
    const parent = category.parentId
      ? await ctx.db.get(category.parentId)
      : null;

    // Get children
    const children = await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get product count
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isDeleted"), false),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    return {
      ...category,
      parent: parent
        ? {
            id: parent._id,
            name: parent.name,
            slug: parent.slug,
          }
        : null,
      children: children.sort((a, b) => a.sortOrder - b.sortOrder),
      productCount: products.length,
    };
  },
});

/**
 * Get category by slug
 *
 * @param slug - Category slug
 * @param tenantId - Optional tenant ID
 * @returns Category or null
 */
export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
    tenantId: v.optional(v.id("tenants")),
  },
  handler: async (ctx, args) => {
    let category;

    if (args.tenantId) {
      category = await ctx.db
        .query("productCategories")
        .withIndex("by_tenant_slug", (q) =>
          q.eq("tenantId", args.tenantId).eq("slug", args.slug)
        )
        .first();
    } else {
      category = await ctx.db
        .query("productCategories")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
    }

    return category;
  },
});

/**
 * Get category breadcrumbs
 *
 * @param categoryId - Category ID
 * @returns Array of categories from root to current
 */
export const getCategoryBreadcrumbs = query({
  args: {
    categoryId: v.id("productCategories"),
  },
  handler: async (ctx, args) => {
    const breadcrumbs: Array<{
      id: Id<"productCategories">;
      name: string;
      slug: string;
    }> = [];

    let currentId: Id<"productCategories"> | undefined = args.categoryId;

    while (currentId) {
      const category: any = await ctx.db.get(currentId);
      if (!category) break;

      breadcrumbs.unshift({
        id: category._id,
        name: category.name,
        slug: category.slug,
      });

      currentId = category.parentId;
    }

    return breadcrumbs;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new category (admin only)
 *
 * @param name - Category name
 * @param slug - URL slug
 * @param description - Category description
 * @param parentId - Parent category ID
 * @param imageUrl - Category image URL
 * @param tenantId - Tenant ID
 * @returns Created category ID
 */
export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("productCategories")),
    imageUrl: v.optional(v.string()),
    tenantId: v.optional(v.id("tenants")),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user is admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.defaultRole !== "admin") {
      throw new Error("Admin role required");
    }

    // Check for duplicate slug
    const existingCategory = args.tenantId
      ? await ctx.db
          .query("productCategories")
          .withIndex("by_tenant_slug", (q) =>
            q.eq("tenantId", args.tenantId).eq("slug", args.slug)
          )
          .first()
      : await ctx.db
          .query("productCategories")
          .withIndex("by_slug", (q) => q.eq("slug", args.slug))
          .first();

    if (existingCategory) {
      throw new Error("Category with this slug already exists");
    }

    // Validate parent exists if provided
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent) {
        throw new Error("Parent category not found");
      }
    }

    // Get max sort order if not provided
    let sortOrder = args.sortOrder;
    if (sortOrder === undefined) {
      const categories = await ctx.db
        .query("productCategories")
        .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
        .collect();

      sortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;
    }

    const now = Date.now();

    const categoryId = await ctx.db.insert("productCategories", {
      tenantId: args.tenantId,
      name: args.name,
      slug: args.slug,
      description: args.description,
      parentId: args.parentId,
      imageUrl: args.imageUrl,
      sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return categoryId;
  },
});

/**
 * Update a category (admin only)
 *
 * @param categoryId - Category ID
 * @param updates - Fields to update
 * @returns Success boolean
 */
export const updateCategory = mutation({
  args: {
    categoryId: v.id("productCategories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    parentId: v.optional(v.id("productCategories")),
    imageUrl: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user is admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.defaultRole !== "admin") {
      throw new Error("Admin role required");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check for duplicate slug if changing
    if (args.slug && args.slug !== category.slug) {
      const existingCategory = category.tenantId
        ? await ctx.db
            .query("productCategories")
            .withIndex("by_tenant_slug", (q) =>
              q.eq("tenantId", category.tenantId).eq("slug", args.slug!)
            )
            .first()
        : await ctx.db
            .query("productCategories")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug!))
            .first();

      if (existingCategory && existingCategory._id !== args.categoryId) {
        throw new Error("Category with this slug already exists");
      }
    }

    // Prevent circular parent reference
    if (args.parentId) {
      if (args.parentId === args.categoryId) {
        throw new Error("Category cannot be its own parent");
      }

      // Check if new parent is a descendant
      let checkId: Id<"productCategories"> | undefined = args.parentId;
      while (checkId) {
        const checkCategory: any = await ctx.db.get(checkId);
        if (!checkCategory) break;
        if (checkCategory.parentId === args.categoryId) {
          throw new Error("Cannot set a descendant as parent");
        }
        checkId = checkCategory.parentId;
      }
    }

    const { categoryId, ...updates } = args;

    await ctx.db.patch(args.categoryId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Delete a category (admin only)
 * Will fail if category has products or children
 *
 * @param categoryId - Category ID
 * @returns Success boolean
 */
export const deleteCategory = mutation({
  args: {
    categoryId: v.id("productCategories"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user is admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.defaultRole !== "admin") {
      throw new Error("Admin role required");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Check for children
    const children = await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.categoryId))
      .first();

    if (children) {
      throw new Error("Cannot delete category with subcategories");
    }

    // Check for products
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .first();

    if (products) {
      throw new Error("Cannot delete category with products");
    }

    await ctx.db.delete(args.categoryId);

    return true;
  },
});

/**
 * Reorder categories (admin only)
 *
 * @param categoryIds - Array of category IDs in new order
 * @returns Success boolean
 */
export const reorderCategories = mutation({
  args: {
    categoryIds: v.array(v.id("productCategories")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Verify user is admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile || profile.defaultRole !== "admin") {
      throw new Error("Admin role required");
    }

    const now = Date.now();

    for (let i = 0; i < args.categoryIds.length; i++) {
      await ctx.db.patch(args.categoryIds[i], {
        sortOrder: i,
        updatedAt: now,
      });
    }

    return true;
  },
});
