import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Multi-tenancy Helpers
 *
 * Utility functions for managing multi-tenant data isolation
 * in the Createconomy platform.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Tenant context for scoped operations
 */
export interface TenantContext {
  tenantId: Id<"tenants"> | null;
  userId: Id<"users"> | null;
  role: string | null;
}

/**
 * Tenant settings
 */
export interface TenantSettings {
  theme?: string;
  logo?: string;
  primaryColor?: string;
  currency?: string;
  timezone?: string;
}

// ============================================================================
// Tenant Resolution
// ============================================================================

/**
 * Get tenant by subdomain
 *
 * @param ctx - Query or mutation context
 * @param subdomain - Subdomain to look up
 * @returns Tenant or null
 */
export async function getTenantBySubdomain(
  ctx: QueryCtx | MutationCtx,
  subdomain: string
) {
  const tenant = await ctx.db
    .query("tenants")
    .withIndex("by_subdomain", (q) => q.eq("subdomain", subdomain))
    .first();

  return tenant;
}

/**
 * Get tenant by domain
 *
 * @param ctx - Query or mutation context
 * @param domain - Domain to look up
 * @returns Tenant or null
 */
export async function getTenantByDomain(
  ctx: QueryCtx | MutationCtx,
  domain: string
) {
  const tenant = await ctx.db
    .query("tenants")
    .withIndex("by_domain", (q) => q.eq("domain", domain))
    .first();

  return tenant;
}

/**
 * Get tenant by slug
 *
 * @param ctx - Query or mutation context
 * @param slug - Slug to look up
 * @returns Tenant or null
 */
export async function getTenantBySlug(
  ctx: QueryCtx | MutationCtx,
  slug: string
) {
  const tenant = await ctx.db
    .query("tenants")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  return tenant;
}

/**
 * Resolve tenant from request context
 * Tries subdomain, then domain, then falls back to default
 *
 * @param ctx - Query or mutation context
 * @param host - Request host header
 * @returns Tenant or null
 */
export async function resolveTenant(
  ctx: QueryCtx | MutationCtx,
  host: string
) {
  // Extract subdomain from host
  const parts = host.split(".");

  // Check if it's a subdomain (e.g., store.createconomy.com)
  if (parts.length >= 3) {
    const subdomain = parts[0]!;
    const tenant = await getTenantBySubdomain(ctx, subdomain);
    if (tenant && tenant.isActive) {
      return tenant;
    }
  }

  // Check if it's a custom domain
  const tenant = await getTenantByDomain(ctx, host);
  if (tenant && tenant.isActive) {
    return tenant;
  }

  return null;
}

// ============================================================================
// User-Tenant Relationships
// ============================================================================

/**
 * Get user's role in a tenant
 *
 * @param ctx - Query or mutation context
 * @param userId - User ID
 * @param tenantId - Tenant ID
 * @returns User's role in the tenant or null
 */
export async function getUserTenantRole(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
): Promise<string | null> {
  const userTenant = await ctx.db
    .query("userTenants")
    .withIndex("by_user_tenant", (q) =>
      q.eq("userId", userId).eq("tenantId", tenantId)
    )
    .first();

  if (!userTenant || !userTenant.isActive) {
    return null;
  }

  return userTenant.role;
}

/**
 * Check if user belongs to a tenant
 *
 * @param ctx - Query or mutation context
 * @param userId - User ID
 * @param tenantId - Tenant ID
 * @returns True if user belongs to tenant
 */
export async function userBelongsToTenant(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
): Promise<boolean> {
  const role = await getUserTenantRole(ctx, userId, tenantId);
  return role !== null;
}

/**
 * Get all tenants a user belongs to
 *
 * @param ctx - Query or mutation context
 * @param userId - User ID
 * @returns List of tenant memberships
 */
export async function getUserTenants(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const userTenants = await ctx.db
    .query("userTenants")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();

  // Get tenant details
  const tenantsWithDetails = await Promise.all(
    userTenants.map(async (ut) => {
      const tenant = await ctx.db.get(ut.tenantId);
      return {
        tenantId: ut.tenantId,
        role: ut.role,
        joinedAt: ut.joinedAt,
        tenant: tenant
          ? {
              name: tenant.name,
              slug: tenant.slug,
              subdomain: tenant.subdomain,
            }
          : null,
      };
    })
  );

  return tenantsWithDetails.filter((t) => t.tenant !== null);
}

/**
 * Add user to tenant
 *
 * @param ctx - Mutation context
 * @param userId - User ID
 * @param tenantId - Tenant ID
 * @param role - User's role in the tenant
 * @returns User-tenant relationship ID
 */
export async function addUserToTenant(
  ctx: MutationCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">,
  role: "customer" | "seller" | "admin" | "moderator" = "customer"
) {
  // Check if relationship already exists
  const existing = await ctx.db
    .query("userTenants")
    .withIndex("by_user_tenant", (q) =>
      q.eq("userId", userId).eq("tenantId", tenantId)
    )
    .first();

  const now = Date.now();

  if (existing) {
    // Reactivate if inactive
    if (!existing.isActive) {
      await ctx.db.patch(existing._id, {
        isActive: true,
        role,
        updatedAt: now,
      });
    }
    return existing._id;
  }

  // Create new relationship
  const id = await ctx.db.insert("userTenants", {
    userId,
    tenantId,
    role,
    isActive: true,
    joinedAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Remove user from tenant
 *
 * @param ctx - Mutation context
 * @param userId - User ID
 * @param tenantId - Tenant ID
 */
export async function removeUserFromTenant(
  ctx: MutationCtx,
  userId: Id<"users">,
  tenantId: Id<"tenants">
) {
  const userTenant = await ctx.db
    .query("userTenants")
    .withIndex("by_user_tenant", (q) =>
      q.eq("userId", userId).eq("tenantId", tenantId)
    )
    .first();

  if (userTenant) {
    await ctx.db.patch(userTenant._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  }
}

// ============================================================================
// Data Isolation Helpers
// ============================================================================

/**
 * Create a tenant-scoped query filter
 * Use this to ensure queries only return data for the specified tenant
 *
 * @deprecated This function is not currently used by any callers. Prefer
 * using `.withIndex("by_tenant", ...)` directly in queries for better
 * performance and type safety. If you need a reusable tenant filter,
 * apply it inline with proper Convex filter builder types.
 *
 * @param tenantId - Tenant ID to filter by
 * @returns Filter function for use with Convex `.filter()` queries
 */
export function tenantFilter(tenantId: Id<"tenants"> | null | undefined) {
  return (q: { eq: (a: unknown, b: unknown) => unknown; field: (name: string) => unknown }) => {
    if (tenantId) {
      return q.eq(q.field("tenantId"), tenantId);
    }
    // Return a tautological expression instead of `true` — Convex .filter()
    // expects a filter expression, not a raw boolean.
    return q.eq(1, 1);
  };
}

/**
 * Validate that a resource belongs to the specified tenant
 *
 * @param resource - Resource to validate
 * @param tenantId - Expected tenant ID
 * @throws Error if resource doesn't belong to tenant
 */
export function validateTenantOwnership(
  resource: { tenantId?: Id<"tenants"> | null } | null,
  tenantId: Id<"tenants"> | null
): void {
  if (!resource) {
    throw new Error("Resource not found");
  }

  // If tenant is specified, resource must belong to it
  if (tenantId && resource.tenantId !== tenantId) {
    throw new Error("Resource does not belong to this tenant");
  }
}

/**
 * Get tenant-specific settings with defaults
 *
 * @param tenant - Tenant object
 * @returns Merged settings with defaults
 */
export function getTenantSettings(
  tenant: { settings?: TenantSettings | null } | null
): TenantSettings {
  const defaults: TenantSettings = {
    theme: "default",
    primaryColor: "#3B82F6",
    currency: "USD",
    timezone: "UTC",
  };

  if (!tenant || !tenant.settings) {
    return defaults;
  }

  return {
    ...defaults,
    ...tenant.settings,
  };
}

// ============================================================================
// Tenant Management
// ============================================================================

/**
 * Create a new tenant
 *
 * @param ctx - Mutation context
 * @param data - Tenant data
 * @returns Created tenant ID
 */
export async function createTenant(
  ctx: MutationCtx,
  data: {
    name: string;
    slug: string;
    subdomain?: string;
    domain?: string;
    settings?: TenantSettings;
  }
) {
  // Validate slug uniqueness
  const existingSlug = await ctx.db
    .query("tenants")
    .withIndex("by_slug", (q) => q.eq("slug", data.slug))
    .first();

  if (existingSlug) {
    throw new Error("Tenant with this slug already exists");
  }

  // Validate subdomain uniqueness if provided
  if (data.subdomain) {
    const existingSubdomain = await ctx.db
      .query("tenants")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", data.subdomain))
      .first();

    if (existingSubdomain) {
      throw new Error("Subdomain already in use");
    }
  }

  // Validate domain uniqueness if provided
  if (data.domain) {
    const existingDomain = await ctx.db
      .query("tenants")
      .withIndex("by_domain", (q) => q.eq("domain", data.domain))
      .first();

    if (existingDomain) {
      throw new Error("Domain already in use");
    }
  }

  const now = Date.now();

  const tenantId = await ctx.db.insert("tenants", {
    name: data.name,
    slug: data.slug,
    subdomain: data.subdomain,
    domain: data.domain,
    settings: data.settings,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return tenantId;
}

/**
 * Update tenant settings
 *
 * @param ctx - Mutation context
 * @param tenantId - Tenant ID
 * @param settings - New settings
 */
export async function updateTenantSettings(
  ctx: MutationCtx,
  tenantId: Id<"tenants">,
  settings: Partial<TenantSettings>
) {
  const tenant = await ctx.db.get(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  await ctx.db.patch(tenantId, {
    settings: {
      ...tenant.settings,
      ...settings,
    },
    updatedAt: Date.now(),
  });
}

/**
 * Deactivate a tenant
 *
 * @param ctx - Mutation context
 * @param tenantId - Tenant ID
 */
export async function deactivateTenant(
  ctx: MutationCtx,
  tenantId: Id<"tenants">
) {
  await ctx.db.patch(tenantId, {
    isActive: false,
    updatedAt: Date.now(),
  });
}

// ============================================================================
// Tenant Statistics
// ============================================================================

/**
 * Get tenant statistics
 *
 * PERF: Uses index-scoped queries (by_tenant_status) to avoid collecting all
 * orders/products for a tenant and filtering in memory. Each status is queried
 * independently via its composite index, so Convex only scans matching rows.
 * Future improvement: maintain pre-computed per-tenant counters updated via
 * mutations to avoid .collect() entirely.
 *
 * @param ctx - Query context
 * @param tenantId - Tenant ID
 * @returns Tenant statistics
 */
export async function getTenantStats(
  ctx: QueryCtx,
  tenantId: Id<"tenants">
) {
  // PERF: userTenants has no by_tenant_role index, so we still collect
  // all active members for this tenant. The set is bounded by tenant size.
  const userTenants = await ctx.db
    .query("userTenants")
    .withIndex("by_tenant", (q) => q.eq("tenantId", tenantId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();

  // PERF: Use by_tenant_status index to count only active products directly,
  // instead of collecting ALL tenant products and filtering in memory.
  const activeProducts = await ctx.db
    .query("products")
    .withIndex("by_tenant_status", (q) =>
      q.eq("tenantId", tenantId).eq("status", "active")
    )
    .filter((q) => q.eq(q.field("isDeleted"), false))
    .collect();

  // PERF: Use by_tenant_status index to query order counts per status,
  // instead of collecting ALL tenant orders and filtering in memory.
  const [
    pendingOrders,
    confirmedOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
  ] = await Promise.all([
    ctx.db
      .query("orders")
      .withIndex("by_tenant_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "pending")
      )
      .collect(),
    ctx.db
      .query("orders")
      .withIndex("by_tenant_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "confirmed")
      )
      .collect(),
    ctx.db
      .query("orders")
      .withIndex("by_tenant_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "processing")
      )
      .collect(),
    ctx.db
      .query("orders")
      .withIndex("by_tenant_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "shipped")
      )
      .collect(),
    ctx.db
      .query("orders")
      .withIndex("by_tenant_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "delivered")
      )
      .collect(),
    ctx.db
      .query("orders")
      .withIndex("by_tenant_status", (q) =>
        q.eq("tenantId", tenantId).eq("status", "cancelled")
      )
      .collect(),
  ]);

  // PERF: Revenue from already-fetched shipped + delivered orders — no extra scan
  const completedOrders = [...shippedOrders, ...deliveredOrders];
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const orderCount =
    pendingOrders.length +
    confirmedOrders.length +
    processingOrders.length +
    shippedOrders.length +
    deliveredOrders.length +
    cancelledOrders.length;

  return {
    userCount: userTenants.length,
    productCount: activeProducts.length,
    orderCount,
    totalRevenue,
    roleBreakdown: {
      customers: userTenants.filter((ut) => ut.role === "customer").length,
      sellers: userTenants.filter((ut) => ut.role === "seller").length,
      admins: userTenants.filter((ut) => ut.role === "admin").length,
      moderators: userTenants.filter((ut) => ut.role === "moderator").length,
    },
  };
}
