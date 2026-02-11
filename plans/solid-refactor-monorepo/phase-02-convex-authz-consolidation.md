# Phase 02 - Convex auth and authorization consolidation

## Objective
Remove duplicated auth and role checks from Convex handlers and move them into reusable policy wrappers.

## SOLID focus
- **S**: handlers stop mixing business logic with access control
- **O**: add new roles and permissions by extending policy layer
- **D**: handlers depend on policy abstractions

## Tasks
- [ ] Create a policy module for role predicates and permission checks in `packages/convex/convex/lib`.
- [ ] Expand middleware wrappers in `packages/convex/convex/lib/middleware.ts` to support:
  - role arrays
  - ownership checks where applicable
  - consistent error contract
- [ ] Standardize auth and authorization errors to shared helpers in `packages/convex/convex/lib/errors.ts`.
- [ ] Migrate high-traffic files first:
  - `packages/convex/convex/functions/orders.ts`
  - `packages/convex/convex/functions/forum.ts`
  - `packages/convex/convex/functions/products.ts`
  - `packages/convex/convex/functions/users.ts`
- [ ] Replace inline `getAuthUserId` plus manual role checks with middleware wrappers.
- [ ] Remove duplicated helper functions that become obsolete after wrapper migration.

## Validation
- [ ] No direct `throw new Error("Authentication required")` in migrated files.
- [ ] All migrated functions use wrappers from middleware.
- [ ] Regression tests for role-protected operations pass.

## Exit criteria
- At least first migration wave complete with no behavior changes.
