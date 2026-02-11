/**
 * Role & Authorization Checking Utilities
 *
 * Provides role hierarchy checks and resource ownership verification
 * for the Createconomy platform.
 * Extracted from security.ts for Single Responsibility Principle compliance.
 *
 * @module
 */

import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";

// ============================================================================
// Authentication
// ============================================================================

/**
 * Validate that a request has required authentication
 *
 * @param ctx - Convex context
 * @throws Error if not authenticated
 */
export async function requireAuth(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  return identity.subject;
}

// ============================================================================
// Role Checking
// ============================================================================

/**
 * Validate that a user has a specific role
 *
 * @param userRole - User's current role
 * @param requiredRole - Required role
 * @param roleHierarchy - Role hierarchy (lower index = lower privilege)
 * @throws Error if user doesn't have required role
 */
export function requireRole(
  userRole: string,
  requiredRole: string,
  roleHierarchy: readonly string[] = ["customer", "seller", "moderator", "admin"]
): void {
  const userIndex = roleHierarchy.indexOf(userRole);
  const requiredIndex = roleHierarchy.indexOf(requiredRole);

  if (userIndex === -1) {
    throw new Error("Invalid user role");
  }

  if (requiredIndex === -1) {
    throw new Error("Invalid required role");
  }

  if (userIndex < requiredIndex) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }
}

// ============================================================================
// Ownership Verification
// ============================================================================

/**
 * Validate that a user owns a resource or has admin privileges
 *
 * @param userId - Current user ID
 * @param resourceOwnerId - Resource owner ID
 * @param userRole - User's role
 * @param adminRoles - Roles that can access any resource
 * @throws Error if user doesn't have access
 */
export function requireOwnershipOrAdmin(
  userId: string,
  resourceOwnerId: string,
  userRole: string,
  adminRoles: string[] = ["admin", "moderator"]
): void {
  if (userId === resourceOwnerId) {
    return; // Owner has access
  }

  if (adminRoles.includes(userRole)) {
    return; // Admin has access
  }

  throw new Error("Access denied. You don't have permission to access this resource.");
}

// ============================================================================
// Security Context
// ============================================================================

export interface SecurityContext {
  /** User ID from authentication */
  userId?: string;
  /** User's role */
  role?: string;
  /** IP address */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Request timestamp */
  timestamp: number;
}
