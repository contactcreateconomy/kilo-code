# Phase 05 - UI component decomposition

## Objective
Break large multi-responsibility components into composable units with focused interfaces.

## SOLID focus
- **S**: each component handles one concern
- **I**: smaller prop contracts
- **O**: enable extension by composition

## Targets
- `apps/admin/src/components/tables/data-table.tsx`
- `packages/ui/src/components/auth/protected-route.tsx`

## Tasks
- [ ] Decompose `DataTable` into subcomponents and hooks:
  - `TableShell`
  - `TableHeader`
  - `TableBody`
  - `useTableSelection`
  - `useTableSort`
- [ ] Replace implicit sorting and selection behavior with pluggable options.
- [ ] Decompose `ProtectedRoute` into:
  - access evaluation utility
  - redirect strategy utility
  - view renderer wrapper
- [ ] Keep shorthand wrappers (`AdminRoute`, `SellerRoute`, `ModeratorRoute`) as thin facades.
- [ ] Preserve existing external component APIs while introducing internal composition.

## Validation
- [ ] Existing table usages render and interact correctly.
- [ ] Auth redirect and fallback behavior remains stable.
- [ ] Component tests updated for decomposed internals.

## Exit criteria
- Multi-concern components converted into composable architecture.
