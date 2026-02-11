# Phase 01 - Baseline and inventory

## Objective
Create a safe starting point before structural refactors.

## Tasks
- [ ] Create a SOLID audit sheet for target files:
  - `packages/convex/convex/functions/orders.ts`
  - `packages/convex/convex/functions/forum.ts`
  - `packages/convex/convex/functions/products.ts`
  - `packages/ui/src/components/auth/protected-route.tsx`
  - `apps/admin/src/components/tables/data-table.tsx`
  - `apps/forum/src/hooks/use-forum.ts`
- [ ] Capture baseline behavior tests for:
  - order creation and cancellation paths
  - seller and admin order views
  - forum thread and post operations
  - route guard redirects and fallback rendering
- [ ] Define non-functional constraints:
  - preserve API contract shapes
  - preserve auth semantics
  - preserve database schema compatibility
- [ ] Document rollback checkpoints for each target area.

## Deliverables
- Baseline checklist complete.
- Regression suite covering critical paths.
- Risk register for each refactor stream.

## Exit criteria
- All baseline tests pass.
- Refactor candidate list is approved and ordered.
