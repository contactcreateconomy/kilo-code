/**
 * Centralized Auth Middleware for Convex Functions
 *
 * This module provides wrapper functions that enforce authentication and
 * authorization by construction. Instead of manually calling `requireAuth(ctx)`
 * or `requireRole(ctx, "admin")` at the start of every function, use these
 * wrappers to guarantee that the handler only runs when the user is properly
 * authenticated and authorized.
 *
 * ## Usage
 *
 * ### Authenticated Query (any logged-in user)
 * ```ts
 * import { authenticatedQuery } from "../lib/middleware";
 * import { v } from "convex/values";
 *
 * export const getMyProfile = authenticatedQuery({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     // ctx.userId is guaranteed to be a valid Id<"users">
 *     const profile = await ctx.db
 *       .query("userProfiles")
 *       .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
 *       .first();
 *     return profile;
 *   },
 * });
 * ```
 *
 * ### Admin Mutation (requires admin role)
 * ```ts
 * import { adminMutation } from "../lib/middleware";
 * import { v } from "convex/values";
 *
 * export const banUser = adminMutation({
 *   args: { userId: v.id("users") },
 *   handler: async (ctx, args) => {
 *     // ctx.userId is the authenticated admin's Id<"users">
 *     await ctx.db.patch(args.userId, { isBanned: true });
 *   },
 * });
 * ```
 *
 * ### Seller Query (requires seller or admin role)
 * ```ts
 * import { sellerQuery } from "../lib/middleware";
 *
 * export const getMyProducts = sellerQuery({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     return await ctx.db
 *       .query("products")
 *       .withIndex("by_seller", (q) => q.eq("sellerId", ctx.userId))
 *       .collect();
 *   },
 * });
 * ```
 *
 * @module
 */

import {
  query,
  mutation,
  action,
  internalQuery,
  internalMutation,
  internalAction,
} from "../_generated/server";
import type { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type {
  PropertyValidators,
  ObjectType,
} from "convex/values";

// ============================================================================
// Authenticated Context Types
// ============================================================================

/**
 * Query context extended with the authenticated user's ID.
 * The `userId` field is guaranteed to be a valid `Id<"users">` because
 * the middleware checks authentication before invoking the handler.
 */
export type AuthenticatedQueryCtx = QueryCtx & {
  /** The authenticated user's document ID */
  userId: Id<"users">;
};

/**
 * Mutation context extended with the authenticated user's ID.
 * The `userId` field is guaranteed to be a valid `Id<"users">` because
 * the middleware checks authentication before invoking the handler.
 */
export type AuthenticatedMutationCtx = MutationCtx & {
  /** The authenticated user's document ID */
  userId: Id<"users">;
};

/**
 * Action context extended with the authenticated user's ID.
 * The `userId` field is guaranteed to be a valid `Id<"users">` because
 * the middleware checks authentication before invoking the handler.
 *
 * Note: Actions use `ctx.auth.getUserIdentity()` which works differently
 * from queries/mutations. The userId is resolved via `getAuthUserId` only
 * when the action has a database context. For pure actions, use with care.
 */
export type AuthenticatedActionCtx = ActionCtx & {
  /** The authenticated user's document ID */
  userId: Id<"users">;
};

// ============================================================================
// Helper: resolve and validate user ID
// ============================================================================

/**
 * Resolves the authenticated user ID from the context.
 * Throws a ConvexError if the user is not authenticated.
 *
 * @param ctx - A query or mutation context
 * @returns The authenticated user's document ID
 * @throws ConvexError with code "UNAUTHENTICATED" if not logged in
 */
async function resolveUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Authentication required",
    });
  }
  return userId;
}

/**
 * Resolves the authenticated user's role from their profile.
 *
 * @param ctx - A query or mutation context
 * @param userId - The authenticated user's document ID
 * @returns The user's defaultRole, or "customer" if no profile exists
 */
async function resolveUserRole(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<string> {
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return profile?.defaultRole ?? "customer";
}

// ============================================================================
// Wrapper Function Types
// ============================================================================

/** Shape of arguments accepted by wrapper functions */
interface AuthenticatedFunctionArgs<
  Args extends PropertyValidators,
  ReturnValue,
> {
  /** Convex argument validators (same as regular query/mutation args) */
  args: Args;
  /** Handler function that receives the authenticated context and validated args */
  handler: (
    ctx: AuthenticatedQueryCtx,
    args: ObjectType<Args>
  ) => Promise<ReturnValue>;
}

interface AuthenticatedMutationArgs<
  Args extends PropertyValidators,
  ReturnValue,
> {
  args: Args;
  handler: (
    ctx: AuthenticatedMutationCtx,
    args: ObjectType<Args>
  ) => Promise<ReturnValue>;
}

// ============================================================================
// Authenticated Wrappers (any logged-in user)
// ============================================================================

/**
 * Creates a **public query** that requires authentication.
 *
 * The handler receives an `AuthenticatedQueryCtx` with the `userId` field
 * already resolved. If the user is not authenticated, a `ConvexError` with
 * code `"UNAUTHENTICATED"` is thrown before the handler runs.
 *
 * @example
 * ```ts
 * export const getMyOrders = authenticatedQuery({
 *   args: { limit: v.optional(v.number()) },
 *   handler: async (ctx, args) => {
 *     return await ctx.db
 *       .query("orders")
 *       .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
 *       .take(args.limit ?? 20);
 *   },
 * });
 * ```
 */
export function authenticatedQuery<
  Args extends PropertyValidators,
  ReturnValue,
>(options: AuthenticatedFunctionArgs<Args, ReturnValue>) {
  return query({
    args: options.args,
    handler: async (ctx: QueryCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const authenticatedCtx: AuthenticatedQueryCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public mutation** that requires authentication.
 *
 * The handler receives an `AuthenticatedMutationCtx` with the `userId` field
 * already resolved. If the user is not authenticated, a `ConvexError` with
 * code `"UNAUTHENTICATED"` is thrown before the handler runs.
 *
 * @example
 * ```ts
 * export const updateProfile = authenticatedMutation({
 *   args: { displayName: v.string() },
 *   handler: async (ctx, args) => {
 *     const profile = await ctx.db
 *       .query("userProfiles")
 *       .withIndex("by_user", (q) => q.eq("userId", ctx.userId))
 *       .first();
 *     if (profile) {
 *       await ctx.db.patch(profile._id, { displayName: args.displayName });
 *     }
 *   },
 * });
 * ```
 */
export function authenticatedMutation<
  Args extends PropertyValidators,
  ReturnValue,
>(options: AuthenticatedMutationArgs<Args, ReturnValue>) {
  return mutation({
    args: options.args,
    handler: async (ctx: MutationCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const authenticatedCtx: AuthenticatedMutationCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public action** that requires authentication.
 *
 * Note: Actions in Convex don't have direct database access, so `getAuthUserId`
 * is used via the auth identity. The `userId` is resolved from the Convex Auth
 * identity subject.
 *
 * @example
 * ```ts
 * export const sendWelcomeEmail = authenticatedAction({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     // ctx.userId is available
 *     // ... call external email API
 *   },
 * });
 * ```
 */
export function authenticatedAction<
  Args extends PropertyValidators,
  ReturnValue,
>(options: {
  args: Args;
  handler: (
    ctx: AuthenticatedActionCtx,
    args: ObjectType<Args>
  ) => Promise<ReturnValue>;
}) {
  return action({
    args: options.args,
    handler: async (ctx: ActionCtx, args: ObjectType<Args>) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError({
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        });
      }
      // For actions, we use the identity subject as the userId string.
      // This is the Convex user document ID stored by @convex-dev/auth.
      const authenticatedCtx: AuthenticatedActionCtx = {
        ...ctx,
        userId: identity.subject as Id<"users">,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

// ============================================================================
// Internal Authenticated Wrappers
// ============================================================================

/**
 * Creates an **internal query** that requires authentication.
 * Same as `authenticatedQuery` but only callable from other Convex functions.
 */
export function authenticatedInternalQuery<
  Args extends PropertyValidators,
  ReturnValue,
>(options: AuthenticatedFunctionArgs<Args, ReturnValue>) {
  return internalQuery({
    args: options.args,
    handler: async (ctx: QueryCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const authenticatedCtx: AuthenticatedQueryCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates an **internal mutation** that requires authentication.
 * Same as `authenticatedMutation` but only callable from other Convex functions.
 */
export function authenticatedInternalMutation<
  Args extends PropertyValidators,
  ReturnValue,
>(options: AuthenticatedMutationArgs<Args, ReturnValue>) {
  return internalMutation({
    args: options.args,
    handler: async (ctx: MutationCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const authenticatedCtx: AuthenticatedMutationCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates an **internal action** that requires authentication.
 * Same as `authenticatedAction` but only callable from other Convex functions.
 */
export function authenticatedInternalAction<
  Args extends PropertyValidators,
  ReturnValue,
>(options: {
  args: Args;
  handler: (
    ctx: AuthenticatedActionCtx,
    args: ObjectType<Args>
  ) => Promise<ReturnValue>;
}) {
  return internalAction({
    args: options.args,
    handler: async (ctx: ActionCtx, args: ObjectType<Args>) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError({
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        });
      }
      const authenticatedCtx: AuthenticatedActionCtx = {
        ...ctx,
        userId: identity.subject as Id<"users">,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

// ============================================================================
// Role-Based Wrappers
// ============================================================================

/**
 * Creates a **public query** that requires the user to have an admin role.
 *
 * Checks authentication first, then verifies the user's `defaultRole` in
 * `userProfiles` is `"admin"`. Throws `ConvexError` with code `"FORBIDDEN"`
 * if the role check fails.
 *
 * @example
 * ```ts
 * export const listAllUsers = adminQuery({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     return await ctx.db.query("userProfiles").collect();
 *   },
 * });
 * ```
 */
export function adminQuery<Args extends PropertyValidators, ReturnValue>(
  options: AuthenticatedFunctionArgs<Args, ReturnValue>
) {
  return query({
    args: options.args,
    handler: async (ctx: QueryCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const role = await resolveUserRole(ctx, userId);
      if (role !== "admin") {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Admin role required",
        });
      }
      const authenticatedCtx: AuthenticatedQueryCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public mutation** that requires the user to have an admin role.
 *
 * Checks authentication first, then verifies the user's `defaultRole` in
 * `userProfiles` is `"admin"`. Throws `ConvexError` with code `"FORBIDDEN"`
 * if the role check fails.
 *
 * @example
 * ```ts
 * export const banUser = adminMutation({
 *   args: { userId: v.id("users") },
 *   handler: async (ctx, args) => {
 *     const profile = await ctx.db
 *       .query("userProfiles")
 *       .withIndex("by_user", (q) => q.eq("userId", args.userId))
 *       .first();
 *     if (profile) {
 *       await ctx.db.patch(profile._id, { isBanned: true, bannedAt: Date.now() });
 *     }
 *   },
 * });
 * ```
 */
export function adminMutation<Args extends PropertyValidators, ReturnValue>(
  options: AuthenticatedMutationArgs<Args, ReturnValue>
) {
  return mutation({
    args: options.args,
    handler: async (ctx: MutationCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const role = await resolveUserRole(ctx, userId);
      if (role !== "admin") {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Admin role required",
        });
      }
      const authenticatedCtx: AuthenticatedMutationCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public query** that requires the user to have an admin or
 * moderator role. Useful for moderation screens.
 *
 * @example
 * ```ts
 * export const getFlaggedContent = adminOrModeratorQuery({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     return await ctx.db
 *       .query("reviews")
 *       .withIndex("by_deleted", (q) => q.eq("isDeleted", false))
 *       .filter((q) => q.eq(q.field("isApproved"), false))
 *       .collect();
 *   },
 * });
 * ```
 */
export function adminOrModeratorQuery<
  Args extends PropertyValidators,
  ReturnValue,
>(options: AuthenticatedFunctionArgs<Args, ReturnValue>) {
  return query({
    args: options.args,
    handler: async (ctx: QueryCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const role = await resolveUserRole(ctx, userId);
      if (role !== "admin" && role !== "moderator") {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Admin or moderator role required",
        });
      }
      const authenticatedCtx: AuthenticatedQueryCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public mutation** that requires the user to have an admin or
 * moderator role. Useful for moderation actions.
 */
export function adminOrModeratorMutation<
  Args extends PropertyValidators,
  ReturnValue,
>(options: AuthenticatedMutationArgs<Args, ReturnValue>) {
  return mutation({
    args: options.args,
    handler: async (ctx: MutationCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const role = await resolveUserRole(ctx, userId);
      if (role !== "admin" && role !== "moderator") {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Admin or moderator role required",
        });
      }
      const authenticatedCtx: AuthenticatedMutationCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public query** that requires the user to have a seller or
 * admin role. Useful for seller dashboard pages.
 *
 * @example
 * ```ts
 * export const getMyProducts = sellerQuery({
 *   args: {},
 *   handler: async (ctx, args) => {
 *     return await ctx.db
 *       .query("products")
 *       .withIndex("by_seller", (q) => q.eq("sellerId", ctx.userId))
 *       .collect();
 *   },
 * });
 * ```
 */
export function sellerQuery<Args extends PropertyValidators, ReturnValue>(
  options: AuthenticatedFunctionArgs<Args, ReturnValue>
) {
  return query({
    args: options.args,
    handler: async (ctx: QueryCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const role = await resolveUserRole(ctx, userId);
      if (role !== "seller" && role !== "admin") {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Seller role required",
        });
      }
      const authenticatedCtx: AuthenticatedQueryCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}

/**
 * Creates a **public mutation** that requires the user to have a seller or
 * admin role. Useful for product management and order fulfillment.
 *
 * @example
 * ```ts
 * export const createProduct = sellerMutation({
 *   args: { name: v.string(), price: v.number() },
 *   handler: async (ctx, args) => {
 *     return await ctx.db.insert("products", {
 *       sellerId: ctx.userId,
 *       name: args.name,
 *       price: args.price,
 *       // ...
 *     });
 *   },
 * });
 * ```
 */
export function sellerMutation<Args extends PropertyValidators, ReturnValue>(
  options: AuthenticatedMutationArgs<Args, ReturnValue>
) {
  return mutation({
    args: options.args,
    handler: async (ctx: MutationCtx, args: ObjectType<Args>) => {
      const userId = await resolveUserId(ctx);
      const role = await resolveUserRole(ctx, userId);
      if (role !== "seller" && role !== "admin") {
        throw new ConvexError({
          code: "FORBIDDEN",
          message: "Seller role required",
        });
      }
      const authenticatedCtx: AuthenticatedMutationCtx = {
        ...ctx,
        userId,
      };
      return await options.handler(authenticatedCtx, args);
    },
  });
}
