/**
 * Shared Cross-Cutting Utilities — Barrel Export
 *
 * Re-exports author enrichment, authorization helpers, and pagination
 * utilities used across domain function files.
 */

// Author enrichment
export type { AuthorInfo } from "./author";
export { enrichAuthor, enrichAuthorBatch } from "./author";

// Authorization helpers
export {
  getUserRole,
  isModOrAdmin,
  requireOwnerOrModAdmin,
  requireOwnerOrAdmin,
  requireTenantAdmin,
} from "./authorization";

// Pagination
export type { PaginatedResult } from "./pagination";
export { paginateWithCursor } from "./pagination";
