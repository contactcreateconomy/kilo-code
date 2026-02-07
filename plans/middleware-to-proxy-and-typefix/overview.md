# Middleware-to-Proxy Migration & TypeScript Fix Plan

## Summary

This plan addresses two interconnected goals across the Createconomy monorepo:

1. **Middleware-to-Proxy Migration**: Migrate every Next.js app from the deprecated `middleware.ts` file convention to the new `proxy.ts` convention as required by Next.js 16.1+
2. **TypeScript Error Resolution**: Fix all TypeScript type-check errors and ensure clean production builds for all four applications

## Current State Analysis

### Middleware Status per App

| App | Current File | Function Export | Status |
|-----|-------------|-----------------|--------|
| **admin** | `src/middleware.ts` | `export function middleware()` | ❌ Uses deprecated convention |
| **marketplace** | `src/middleware.ts` | `export function middleware()` | ❌ Uses deprecated convention |
| **seller** | `src/middleware.ts` | `export function middleware()` | ❌ Uses deprecated convention |
| **forum** | `src/proxy.ts` | `export function proxy()` | ✅ Already migrated |

### Key Migration Requirements (from Next.js docs)

Per [nextjs.org/docs/messages/middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy):

- **File**: Rename `middleware.ts` → `proxy.ts`  
- **Function**: Rename `export function middleware()` → `export function proxy()`
- **Config**: The `export const config` with `matcher` remains the same
- **Location**: `src/proxy.ts` (since apps use `src/` directory)
- **Behavior**: All logic (headers, redirects, auth checks, CORS) remains identical

### Build Pipeline

- Monorepo uses Turborepo with dependency chain: `packages/config` → `packages/convex` → `packages/ui` → `apps/*`
- Build command per app: `pnpm --filter @createconomy/<app> build`
- TypeScript check per app: `pnpm --filter @createconomy/<app> typecheck`
- Per workspace rules: builds must be sequential, Node.js processes killed between builds

## Phase Plan

| Phase | File | Description |
|-------|------|-------------|
| [Phase 01](./phase-01-admin-proxy.md) | Admin proxy migration | Rename `middleware.ts` → `proxy.ts`, rename function |
| [Phase 02](./phase-02-marketplace-proxy.md) | Marketplace proxy migration | Rename `middleware.ts` → `proxy.ts`, rename function |
| [Phase 03](./phase-03-seller-proxy.md) | Seller proxy migration | Rename `middleware.ts` → `proxy.ts`, rename function |
| [Phase 04](./phase-04-forum-verify.md) | Forum verification | Verify existing `proxy.ts` is correct |
| [Phase 05](./phase-05-typecheck-fixes.md) | TypeScript fixes | Run typecheck on all packages/apps, fix errors |
| [Phase 06](./phase-06-build-validation.md) | Build validation | Sequential production builds, fix any build failures |

## Risk Assessment

- **Low Risk**: The proxy migration is a straightforward rename. The function signature and all logic remain identical.
- **Medium Risk**: TypeScript errors may cascade across the monorepo due to shared packages. Fixing errors in `packages/ui` or `packages/convex` may resolve errors in multiple apps simultaneously.
- **.next cleanup**: Stale `.next` build cache may reference old `middleware.ts` paths and must be cleaned before rebuilding.
