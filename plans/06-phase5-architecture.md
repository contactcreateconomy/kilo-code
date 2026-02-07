# Phase 5: Architecture and Design Improvements

## Finding A1: No Centralized Auth Middleware for Convex Functions - HIGH

**Problem**: Each Convex function manually calls `requireAuth(ctx)`, `requireRole(ctx, "admin")`, etc. at the start of its handler. This is repetitive and error-prone — a developer could forget to add the auth check to a new function, creating an unprotected endpoint.

**Affected Files**: All files in `packages/convex/convex/functions/`

**Root Cause**: Convex does not have built-in middleware, so auth checks are manually added per function.

**Fix**: Create wrapper functions that enforce auth by construction.

**Refactored Example**:
```typescript
// lib/middleware.ts
import { QueryCtx, MutationCtx } from "../_generated/server";

export function authenticatedQuery<Args extends Record<string, unknown>, Returns>(
  config: {
    args: Args;
    handler: (ctx: QueryCtx, args: Args, userId: string) => Promise<Returns>;
  }
) {
  return query({
    args: config.args,
    handler: async (ctx, args) => {
      const userId = await requireAuth(ctx);
      return config.handler(ctx, args, userId);
    },
  });
}

export function adminQuery<Args, Returns>(...) { /* similar with role check */ }
export function adminMutation<Args, Returns>(...) { /* similar with role check */ }
```

### Tasks
- [ ] Create `packages/convex/convex/lib/middleware.ts` with auth wrapper functions
- [ ] Define `authenticatedQuery`, `authenticatedMutation`, `authenticatedAction`
- [ ] Define `adminQuery`, `adminMutation` with role checks
- [ ] Gradually migrate existing functions to use the wrappers
- [ ] Add documentation explaining the middleware pattern

---

## Finding A2: Centralize Order Number Generation - MEDIUM

**Files**:
- [`packages/convex/convex/functions/orders.ts`](../packages/convex/convex/functions/orders.ts:406)
- [`packages/convex/convex/functions/stripe.ts`](../packages/convex/convex/functions/stripe.ts:643)

**Problem**: Order number generation logic is duplicated across `orders.ts` and `stripe.ts` with slightly different implementations. Both use `Math.random()` and `Date.now()` which could produce collisions.

**Fix**: Extract into a shared utility in `lib/`.

### Tasks
- [ ] Create `packages/convex/convex/lib/order-utils.ts`
- [ ] Extract `generateOrderNumber()` into the shared module using `crypto.randomUUID()`
- [ ] Update both `orders.ts` and `stripe.ts` to import from the shared module
- [ ] Add collision detection in the utility

---

## Finding A3: Rate Limiting Defined But Never Used - MEDIUM

**Files**:
- [`packages/convex/convex/lib/security.ts`](../packages/convex/convex/lib/security.ts)
- [`packages/convex/convex/helpers/validation.ts`](../packages/convex/convex/helpers/validation.ts)

**Problem**: Both files define rate limiting types, interfaces, and utility functions, but no Convex query or mutation in the entire codebase actually invokes rate limiting. This is dead code that gives a false sense of security.

**Fix**: Either implement rate limiting in the relevant mutations or remove the dead code.

### Tasks
- [ ] Identify mutations that need rate limiting: `incrementViewCount`, `createOrder`, `createReview`, `requestSellerRole`, auth endpoints
- [ ] Implement actual rate limiting using Convex's database to track request counts
- [ ] Consider using `@convex-dev/ratelimiter` if available
- [ ] Remove duplicate rate limiting code from `helpers/validation.ts`

---

## Finding A4: Use Convex Scheduled Functions for Cleanup - LOW

**File**: [`packages/convex/convex/auth.ts`](../packages/convex/convex/auth.ts:452)

**Problem**: `cleanupExpiredSessions` is an exposed mutation that must be called externally. There is no guarantee it runs regularly. If no one calls it, expired sessions accumulate forever.

**Fix**: Use Convex cron jobs to schedule automatic cleanup.

### Tasks
- [ ] Create a `convex/crons.ts` file with session cleanup scheduled every hour
- [ ] Convert `cleanupExpiredSessions` to an `internalMutation`
- [ ] Add similar cron for cleaning up soft-deleted records
- [ ] Add monitoring/logging for cleanup operations

---

## Finding A5: Missing Input Validation on Several Mutations - MEDIUM

**Problem**: While Convex enforces argument validators at the schema level, several mutations lack business logic validation:
- `createProduct`: No slug uniqueness check
- `createProduct`: No maximum price validation
- `createOrder`: No minimum order total check
- `updateProduct`: No validation that price changes dont affect existing orders

**Fix**: Add business logic validators.

### Tasks
- [ ] Add slug uniqueness validation in `createProduct`
- [ ] Add price range validation with configurable min/max
- [ ] Add minimum order total validation
- [ ] Create shared validation constants in `lib/constants.ts`

---

## Finding A6: Soft Delete Without Cleanup Strategy - LOW

**Problem**: Multiple tables use `isDeleted` soft delete flag, but there is no mechanism to permanently remove soft-deleted records after a retention period. This means the database grows indefinitely.

**Fix**: Implement a retention policy with scheduled cleanup.

### Tasks
- [ ] Define retention periods for each table type
- [ ] Create a scheduled function to permanently delete old soft-deleted records
- [ ] Add `deletedAt` timestamp alongside `isDeleted` boolean for age-based cleanup
- [ ] Ensure all queries filter out `isDeleted: true` records

---

## Finding A7: No API Versioning Strategy - LOW

**Problem**: HTTP endpoints in `http.ts` are not versioned. When breaking changes are needed, all clients must update simultaneously.

**Fix**: Prefix HTTP routes with a version number.

### Tasks
- [ ] Add `/v1/` prefix to all HTTP endpoints
- [ ] Create a migration strategy document for API version bumps
- [ ] Consider using a versioning middleware pattern

---

## Summary: Execution Order

The phases should be executed in this order:

1. **Phase 0**: Remove unused Docker files — quick win, no risk
2. **Phase 1**: Fix critical security vulnerabilities — highest priority
3. **Phase 2**: Fix bugs and logic errors — prevent data corruption
4. **Phase 3**: Performance optimizations — improve user experience
5. **Phase 4**: Code quality improvements — improve maintainability
6. **Phase 5**: Architecture improvements — long-term sustainability
