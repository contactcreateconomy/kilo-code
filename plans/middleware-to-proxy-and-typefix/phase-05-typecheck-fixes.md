# Phase 05: TypeScript Type-Check Fixes

## Objective

Run `tsc --noEmit` on every package and app in dependency order, identify all TypeScript errors, and fix them.

## Execution Order

Per the local build rules, type-checking must be done **sequentially** with Node.js processes killed between each run:

1. `packages/config` — shared configs, no build needed for this package
2. `packages/convex` — backend schema, generated types
3. `packages/ui` — shared UI components, hooks, types
4. `apps/admin` — via `pnpm --filter @createconomy/admin typecheck`
5. `apps/forum` — via `pnpm --filter @createconomy/forum typecheck`
6. `apps/marketplace` — via `pnpm --filter @createconomy/marketplace typecheck`
7. `apps/seller` — via `pnpm --filter @createconomy/seller typecheck`

## Pre-Requisites

Before running type-checks:
- All middleware.ts files must be renamed to proxy.ts (Phases 01-03 complete)
- All `.next/` directories should be cleaned to avoid stale type references

## Known Areas of Concern

### Config Package
- [`packages/config/security-headers.ts`](../../packages/config/security-headers.ts) — Exports used by marketplace's `next.config.ts`. Check that `buildCsp`, `toNextHeaders`, `baseSecurityHeaders` types are compatible.
- [`packages/config/csp/marketplace.ts`](../../packages/config/csp/marketplace.ts) — Exports `getMarketplaceCsp` used by marketplace config.

### UI Package
- Auth components export many types — check all type re-exports compile correctly
- [`packages/ui/src/hooks/use-auth-form.ts`](../../packages/ui/src/hooks/use-auth-form.ts) — Uses `useCallback` with async functions
- [`packages/ui/src/components/auth/auth-provider.tsx`](../../packages/ui/src/components/auth/auth-provider.tsx) — Complex session/auth state management
- [`packages/ui/src/components/auth/protected-route.tsx`](../../packages/ui/src/components/auth/protected-route.tsx) — HOC `withAuth` typing

### Apps
- All apps import from `@createconomy/ui` and `@createconomy/convex` — any type errors in packages cascade to apps
- Check auth-related page components in all apps for compatibility with shared auth hooks
- Marketplace `next.config.ts` imports from `@createconomy/config/csp/marketplace` and `@createconomy/config/security-headers` — verify these resolve correctly

## Process

For each target:
1. Kill all Node.js processes
2. Run `tsc --noEmit` or `pnpm --filter <target> typecheck`
3. Record all errors
4. Fix errors
5. Re-run to confirm zero errors
6. Move to next target

## Error Categories to Watch For

- **Missing type annotations** — strict mode requires explicit types
- **`noUncheckedIndexedAccess`** — accessing array/object indices may return `undefined`
- **`verbatimModuleSyntax`** — `import type` must be used for type-only imports
- **`noPropertyAccessFromIndexSignature`** — must use bracket notation for index signatures
- **Incompatible type assignments** — especially in generic React component props
- **Missing interface properties** — strict mode catches partial implementations
