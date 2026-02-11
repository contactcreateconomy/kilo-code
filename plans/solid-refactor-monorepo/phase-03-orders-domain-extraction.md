# Phase 03 - Orders domain service extraction

## Objective
Refactor order lifecycle logic into domain services and keep Convex handlers thin.

## SOLID focus
- **S**: separate orchestration, business rules, and persistence access
- **O**: status transition behavior extensible via policy maps
- **D**: handlers depend on service interfaces

## Tasks
- [ ] Create `orders` service folder in `packages/convex/convex/lib`.
- [ ] Extract business rules from `packages/convex/convex/functions/orders.ts` into focused units:
  - cart validation
  - inventory reservation and restore
  - order total calculation
  - status transition validation
  - authorization guard adapter
- [ ] Introduce repository helpers for repeated order and orderItems query patterns.
- [ ] Move response mapping and enrichment into mapper functions.
- [ ] Replace in-function loops with dedicated service methods.
- [ ] Keep exported Convex function signatures unchanged.

## Suggested target module split
- `orders.service.ts`
- `orders.repository.ts`
- `orders.policies.ts`
- `orders.mappers.ts`
- `orders.types.ts`

## Validation
- [ ] `createOrder`, `updateOrderStatus`, and `cancelOrder` behavior preserved.
- [ ] seller dashboard queries preserve output shape.
- [ ] No duplicated status transition logic between functions.

## Exit criteria
- `orders.ts` reduced to coordinator layer with minimal domain logic.
