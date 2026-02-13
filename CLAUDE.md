# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Createconomy is a pnpm + Turborepo monorepo with four Next.js apps backed by a shared Convex backend.

- `apps/marketplace` (`@createconomy/marketplace`) — storefront, port `3000`
- `apps/forum` (`@createconomy/forum`) — community forum, port `3001`
- `apps/admin` (`@createconomy/admin`) — admin console, port `3002`
- `apps/seller` (`@createconomy/seller`) — seller dashboard, port `3003`
- `packages/convex` (`@createconomy/convex`) — Convex schema/functions/auth/http endpoints
- `packages/ui` (`@createconomy/ui`) — shared UI components/hooks/utilities
- `packages/config` (`@createconomy/config`) — shared lint/TS/Tailwind/security config

## Tooling and runtime

- Package manager: `pnpm` (workspace root uses `pnpm@10.28.2`)
- Node: `>=24`
- Task runner: Turborepo (`turbo run ...` from root scripts)

## Common commands

Run from repository root unless noted.

### Install and run

- `pnpm install`
- `pnpm dev` — run dev tasks across workspace packages
- `pnpm --filter @createconomy/marketplace dev`
- `pnpm --filter @createconomy/forum dev`
- `pnpm --filter @createconomy/admin dev`
- `pnpm --filter @createconomy/seller dev`

### Convex backend

- `pnpm --filter @createconomy/convex dev` (or `cd packages/convex && npx convex dev`)
- First-time initialization: `cd packages/convex && npx convex dev --once`
- Deploy backend: `cd packages/convex && npx convex deploy`

### Quality checks

- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`

### Tests

- `pnpm test`
- `pnpm test:watch`
- `pnpm test:coverage`

Single test file (Vitest in packages that define test scripts):

- Marketplace: `pnpm --filter @createconomy/marketplace test -- <path-to-test-file>`
- UI package: `pnpm --filter @createconomy/ui test -- <path-to-test-file>`

Note: `forum`, `admin`, and `seller` currently do not define `test` scripts in their package manifests.

## Architecture (big picture)

### 1) Frontend apps

All four apps use Next.js App Router and consume shared code from `@createconomy/ui` and `@createconomy/convex`.

Typical app composition:

- app routes/layouts in `apps/<app>/src/app`
- app-specific UI/hooks in `apps/<app>/src/components` and `apps/<app>/src/hooks`
- Convex/auth provider wiring in `apps/<app>/src/providers`

### 2) Backend and data model

Convex is the system of record for application data and business logic:

- schema: `packages/convex/convex/schema.ts`
- HTTP endpoints (including auth/session endpoints): `packages/convex/convex/http.ts`
- role/auth wrappers: `packages/convex/convex/lib/middleware.ts`
- domain functions: `packages/convex/convex/functions/**`

Schema includes multi-tenant identity/auth, commerce, forum, Stripe, and rate-limiting tables. App clients access Convex via generated API/types exported from `@createconomy/convex`.

### 3) Auth/session model

Cross-subdomain auth is handled through Convex auth + a custom `sessions` model and HTTP endpoints in `packages/convex/convex/http.ts` (not only Next.js cookie-local session state).

### 4) Shared packages

- `@createconomy/ui`: design-system components, hooks, helpers, tokens
- `@createconomy/config`: centralized shared config (TS/ESLint/Tailwind/security headers)
- `@createconomy/convex`: generated client API plus backend implementation

## Project-specific implementation notes

- Do not edit `packages/convex/convex/_generated/*`; run Convex dev to regenerate.
- Schema edits require Convex dev running (`npx convex dev`) or generated types drift.
- Monetary values are stored in cents (integer).
- Soft-delete patterns are used in domain models (`isDeleted`, `deletedAt`) rather than immediate hard deletes.
- Rate limiting has a DB-backed path via `rateLimitRecords`.

## ESLint setup

- Next.js 16 removed `next lint`. Each app has `eslint.config.mjs` that re-exports from `@createconomy/config/eslint` with `projectService: true` and `tsconfigRootDir: import.meta.dirname`.
- Lint individual app: `pnpm --filter @createconomy/admin lint`
- `complexity` and `max-lines-per-function` are `warn` (many pre-existing violations in admin/forum pages).

## Build gotchas

- `pnpm build` (all 4 apps in parallel) can OOM on Windows. Build individually: `pnpm --filter @createconomy/admin build`
- Convex insert functions require `as never` casts due to Convex's strict table insert typing — this is a known pattern.
- Index signature properties must use bracket notation (`patch["fieldName"]`) not dot access due to `noPropertyAccessFromIndexSignature`.

## Backend domain architecture

Convex backend functions delegate to layered domain modules in `packages/convex/convex/lib/`:

- `lib/shared/` — cross-cutting: `author.ts` (enrichment), `authorization.ts`, `pagination.ts`
- `lib/orders/` — order domain (reference pattern)
- `lib/forum/` — forum domain: `forum.types.ts`, `forum.repository.ts`, `forum.policies.ts`, `forum.service.ts`, `forum.mappers.ts`
- `lib/products/` — products domain (same layered pattern)
- `lib/users/` — users domain (same layered pattern)
- `lib/policies.ts` — shared authorization policy helpers

Pattern: function files in `convex/functions/*.ts` are thin orchestration handlers that import from `lib/<domain>/`. Repository functions use `ReadCtx = Pick<QueryCtx, "db">` and `WriteCtx = Pick<MutationCtx, "db">`.

ADRs documenting these decisions are in `docs/adr/`.

## Guidance sources in this repo

- `README.md` (monorepo layout, commands, deployment setup)
- `docs/commands.md` (script reference)
- `docs/conventions.md` and `docs/pitfalls.md` (repo coding patterns and gotchas)
- `AGENTS.md` (existing AI-agent-oriented quick reference)

## Branch naming convention

Branches use a sequential numeric prefix: `NNN-description`. The next branch number is **015**. Always increment from the highest existing branch number. Examples:

- `013-SOLID-principle`
- `014-refactor/solid-cleanup`
- `015-<next-feature>`

Cursor/Copilot rule files were not found in this checkout:

- No `.cursorrules`
- No `.cursor/rules/**`
- No `.github/copilot-instructions.md`
