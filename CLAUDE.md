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

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Dev all | `pnpm dev` |
| Dev single | `pnpm --filter @createconomy/marketplace dev` |
| Build all | `pnpm build` |
| Build single | `pnpm --filter @createconomy/admin build` |
| Typecheck | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Test | `pnpm test` |
| Convex dev | `cd packages/convex && npx convex dev` |
| Convex deploy | `cd packages/convex && npx convex deploy` |

Single test file: `pnpm --filter @createconomy/marketplace test -- <path>`

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for diagrams and data flow.

### Frontend apps

All four apps use Next.js App Router. Typical composition:
- `apps/<app>/src/app` — routes/layouts
- `apps/<app>/src/components` + `apps/<app>/src/hooks` — app-specific UI
- `apps/<app>/src/providers` — Convex/auth/theme providers

### Backend (`packages/convex/`)

Convex is the system of record. See [`docs/key-files.md`](docs/key-files.md) for full file map.

- Schema: `convex/schema.ts` — see [`docs/data-models.md`](docs/data-models.md)
- Functions: `convex/functions/*.ts` — thin orchestration, delegate to `lib/<domain>/`
- Domain modules: `lib/orders/`, `lib/forum/`, `lib/products/`, `lib/users/`, `lib/shared/`
- Auth: `convex/auth.ts` + `convex/http.ts` (cross-subdomain sessions)
- Middleware: `lib/middleware.ts` — `authenticatedQuery`, `adminMutation`, `sellerQuery`, etc.

Pattern: Repository functions use `ReadCtx = Pick<QueryCtx, "db">` and `WriteCtx = Pick<MutationCtx, "db">`.

### Shared packages

- `@createconomy/ui`: design-system components, hooks, tokens — see [`docs/design-system.md`](docs/design-system.md)
- `@createconomy/config`: ESLint, TS, Tailwind, security headers
- `@createconomy/convex`: generated client API + backend implementation

## SOLID principles (mandatory for all code changes)

Every modification — new feature, refactor, or bug fix — must follow these principles:

### S — Single Responsibility

- Each file/module/function does **one thing**. If a function name has "and" in it, split it.
- Convex function files (`convex/functions/*.ts`) are thin orchestration only — business logic lives in `lib/<domain>/service.ts`.
- React components render UI. Data fetching, transformation, and side effects go in hooks or service layers.
- Max ~200 lines per file. If a component/module exceeds this, extract sub-components or helpers.

### O — Open/Closed

- Extend behavior through **composition**, not modification of existing code.
- Use the domain module pattern: add new domain modules in `lib/<newdomain>/` following the existing `types → repository → policies → service → mappers` layering.
- React: prefer compound components and render props over adding boolean prop flags to existing components.
- Convex: add new functions rather than adding conditional branches to existing ones.

### L — Liskov Substitution

- Shared types/interfaces in `packages/ui/src/types/` must be substitutable across all 4 apps.
- If a hook returns `{ data, loading, error }`, all hooks returning that shape must behave identically — no surprise `undefined` vs `null` differences.
- Auth middleware wrappers (`authenticatedQuery`, `adminQuery`, etc.) must all provide the same `ctx.userId` contract.

### I — Interface Segregation

- Don't force consumers to depend on things they don't use.
- Barrel exports (`index.ts`) should re-export granularly — apps import only what they need.
- Convex function args: only declare validators for fields the function actually uses.
- React component props: prefer small, focused prop interfaces. Split large components into smaller ones with their own props rather than one component with 15+ props.

### D — Dependency Inversion

- High-level modules (app pages/components) depend on abstractions (hooks, service interfaces), not concrete implementations.
- Apps import from `@createconomy/ui` and `@createconomy/convex` — never reach into internal package paths.
- Domain service functions accept `ReadCtx`/`WriteCtx` (abstractions over `QueryCtx`/`MutationCtx`), not concrete Convex context objects.
- Shared utilities go in `packages/ui` or `packages/config` — app-specific code never imports from another app.

### How this maps to the codebase

| Layer | Responsibility | Location |
|-------|---------------|----------|
| Function handlers | Thin orchestration (auth + delegate) | `convex/functions/*.ts` |
| Domain services | Business logic | `convex/lib/<domain>/service.ts` |
| Repositories | DB read/write operations | `convex/lib/<domain>/repository.ts` |
| Policies | Authorization rules | `convex/lib/<domain>/policies.ts` |
| Types | Domain type definitions | `convex/lib/<domain>/types.ts` |
| Mappers | Data transformation | `convex/lib/<domain>/mappers.ts` |
| Shared | Cross-cutting concerns | `convex/lib/shared/` |
| UI components | Presentation only | `packages/ui/src/components/` |
| App hooks | Data fetching + state | `apps/<app>/src/hooks/` |
| App pages | Route composition | `apps/<app>/src/app/` |

## Critical rules

### Always

- TypeScript strict mode. No `any` types.
- All data ops through Convex. Never direct DB writes from client.
- Use `createError(ErrorCode.*, message)` for user-facing errors.
- Prices in **cents** (integer). Use `centsToDollars()`/`dollarsToCents()`.
- Soft-delete: `isDeleted: true, deletedAt: Date.now()`. Never hard-delete.
- Use auth middleware wrappers for new Convex functions.
- `pnpm format` and `pnpm typecheck` before committing.
- Prefix client env vars with `NEXT_PUBLIC_`.
- Use consistent-type-imports with inline style.

### Never

- Edit `packages/convex/convex/_generated/*`
- Use `var`, `forwardRef`, `useContext`, `v.any()`
- Commit `.env` / `.env.local` files
- Use npm/yarn — only pnpm
- Store prices in dollars/floats
- Log sensitive data (passwords, tokens, PII)

## Build gotchas

- `pnpm build` (all 4 apps in parallel) can OOM on Windows. Build individually.
- Convex insert functions require `as never` casts — known pattern.
- Index signature properties must use bracket notation (`patch["fieldName"]`).
- Schema changes require `npx convex dev` running or generated types drift.

## ESLint setup

- Each app has `eslint.config.mjs` re-exporting from `@createconomy/config/eslint` with `projectService: true`.
- `complexity` and `max-lines-per-function` are `warn`.
- Lint individual app: `pnpm --filter @createconomy/admin lint`

## Branch naming convention

Branches use a sequential numeric prefix: `NNN-type/description`. The next branch number is **015**. Always increment from the highest existing branch number. Examples:

- `013-SOLID-principle`
- `014-refactor/solid-cleanup`
- `015-<next-feature>`

## Documentation index

All docs live in [`docs/`](docs/). Key references:

| Document | What it covers |
|----------|---------------|
| [`architecture.md`](docs/architecture.md) | System design, data flow, auth flow |
| [`key-files.md`](docs/key-files.md) | File locations, domain module structure |
| [`data-models.md`](docs/data-models.md) | Database schema (all tables) |
| [`api-reference.md`](docs/api-reference.md) | Convex functions, HTTP endpoints |
| [`conventions.md`](docs/conventions.md) | Naming, imports, React/Convex patterns |
| [`pitfalls.md`](docs/pitfalls.md) | Common mistakes, known issues |
| [`design-system.md`](docs/design-system.md) | UI tokens, components, theming |
| [`security.md`](docs/security.md) | Auth, headers, rate limiting, Stripe |
| [`deployment.md`](docs/deployment.md) | Vercel setup, domains |
| [`environment.md`](docs/environment.md) | Env vars reference |
| [`contributing.md`](docs/contributing.md) | Branch naming, commits, PR process |
| [`troubleshooting.md`](docs/troubleshooting.md) | Common issues, debug tips |
| [`adr/`](docs/adr/) | Architecture Decision Records |
