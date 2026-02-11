# Phase 04 - Frontend typing and contract hardening

## Objective
Harden app and shared UI interfaces to remove unsafe casts and broad untyped surfaces.

## SOLID focus
- **L**: preserve substitutable contracts between hooks, components, and backend responses
- **I**: expose narrow, purpose-specific interfaces
- **D**: depend on shared DTO contracts rather than ad hoc local shapes

## Tasks
- [ ] Create shared DTO and result contracts in `packages/ui/src/types` or dedicated shared contract location.
- [ ] Refactor forum hooks in `apps/forum/src/hooks/use-forum.ts`:
  - remove `any`
  - replace `as never` with typed IDs and function arg helpers
  - return strongly typed loading and data states
- [ ] Standardize hook result envelopes across apps:
  - `isLoading`
  - `error`
  - `data`
- [ ] Align Convex response mappers with frontend expected types.
- [ ] Add compile-time guards for contract drift.

## Validation
- [ ] No `any` in targeted hooks and adapters.
- [ ] Strict TypeScript passes in all four apps.
- [ ] Existing UI behavior remains unchanged.

## Exit criteria
- Frontend data and mutation hooks expose explicit, stable contracts.
