# ADR 001: Auth Policy Model and Ownership Boundaries

## Status
Accepted

## Context
Convex handlers across orders.ts, forum.ts, products.ts, and users.ts contained duplicated inline authentication and authorization checks. Each handler independently called `getAuthUserId()`, performed manual role comparisons, and threw inconsistent error messages. This duplication created maintenance burden and inconsistent error handling.

## Decision
We consolidated auth/authorization into three layers:
1. **Middleware wrappers** (`authenticatedMutation`, `adminMutation`, `sellerMutation`) in `lib/middleware.ts` — handle authentication and role-based access at the wrapper level
2. **Policy module** (`lib/policies.ts`) — composable policy predicates (`hasAnyRole`, `isOwner`, `orPolicy`, `andPolicy`, `ownerOrRoles`) for complex authorization logic
3. **Standardized errors** (`lib/errors.ts`) — `ErrorCode` constants and `createError()` factory for consistent error responses

Handlers that require authentication use middleware wrappers. Complex ownership/role checks (e.g., "owner OR moderator") use middleware for auth + inline checks using policy predicates.

Intentionally unauthenticated patterns (queries returning null/empty for anonymous users, view counters) remain as raw `query()`/`mutation()`.

## Consequences
- Single source of truth for auth behavior per handler type
- New roles/permissions added by extending policy module, not editing handlers
- Auth errors are consistent (structured ConvexError with error codes)
- Handlers are shorter and focused on business logic
- Some ownership checks remain inline where middleware doesn't support the pattern
