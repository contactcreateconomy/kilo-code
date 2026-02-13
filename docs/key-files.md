# Key Files & Entry Points

> Important file locations across the Createconomy platform.

---

## Backend (`packages/convex/convex/`)

### Core files

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema — all tables, indexes, validators |
| `auth.ts` | Convex Auth (Google + GitHub OAuth), session CRUD |
| `auth.config.ts` | CORS origins, cookie config, session TTL (7d) |
| `http.ts` | HTTP router: auth endpoints, Stripe webhook, health check |
| `crons.ts` | Hourly session cleanup, daily soft-delete purge |

### Function files (thin orchestration)

| File | Purpose |
|------|---------|
| `functions/products.ts` | Product CRUD, search, view counting |
| `functions/orders.ts` | Order management |
| `functions/cart.ts` | Shopping cart operations |
| `functions/users.ts` | User profiles, role changes |
| `functions/forum.ts` | Threads, posts, comments, reactions |
| `functions/stripe.ts` | Payment processing, webhook events |
| `functions/sessions.ts` | Cross-subdomain session validation |

### Domain modules (`lib/`)

| Path | Purpose |
|------|---------|
| `lib/shared/` | Cross-cutting: `author.ts` (enrichment), `authorization.ts`, `pagination.ts` |
| `lib/orders/` | Order domain: types, repository, policies, service, mappers |
| `lib/forum/` | Forum domain: same layered pattern |
| `lib/products/` | Products domain: same layered pattern |
| `lib/users/` | Users domain: same layered pattern |
| `lib/policies.ts` | Shared authorization policy helpers |
| `lib/middleware.ts` | Auth wrappers: `authenticatedQuery`, `adminMutation`, `sellerQuery`, etc. |
| `lib/errors.ts` | `ErrorCode` enum + `createError()` factory |
| `lib/constants.ts` | Business limits: `PRODUCT_LIMITS`, `ORDER_LIMITS`, etc. |
| `lib/security.ts` | Rate limiting (DB-backed), input validation, audit logging |

Pattern: function files are thin orchestration → delegate to `lib/<domain>/`. Repository functions use `ReadCtx` / `WriteCtx`.

---

## Frontend (per app)

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers (Convex, Theme) |
| `src/app/page.tsx` | Home page |
| `src/middleware.ts` | Session check, security headers, CORS, CSP |
| `src/providers/convex-provider.tsx` | Convex client + auth provider |
| `src/app/api/auth/[...auth]/route.ts` | Convex Auth catch-all route |

---

## Shared UI (`packages/ui/`)

| File | Purpose |
|------|---------|
| `src/index.ts` | Barrel export of all shared components/hooks |
| `src/lib/utils.ts` | `cn()` — Tailwind class merging |
| `src/components/auth/` | `ProtectedRoute`, `useAuthGuard`, `auth-utils` |
| `src/types/envelope.ts` | Shared type contracts |

---

## Config (`packages/config/`)

| File | Purpose |
|------|---------|
| `eslint.config.mjs` | Shared ESLint 9 flat config |
| `tsconfig.base.json` | Base TypeScript config (strict) |
| `tsconfig.nextjs.json` | Next.js TypeScript extensions |
| `tailwind.config.ts` | Shared Tailwind 4 config |
| `security-headers.ts` | Shared security headers builder |
| `csp/` | Per-app Content Security Policy configs |
