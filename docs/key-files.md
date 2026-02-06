# Key Files & Entry Points

> Important file locations across the Createconomy platform.

---

## Backend (packages/convex/convex/)

| File | Purpose |
|------|---------|
| `schema.ts` | **All** database tables, indexes, search indexes, validators. Single source of truth for data model. |
| `auth.ts` | Convex Auth setup (Google + GitHub OAuth), session CRUD, cross-subdomain session management |
| `auth.config.ts` | CORS origins, cookie config, session TTL (7d), refresh threshold (1d) |
| `http.ts` | HTTP router: auth endpoints (`/auth/session`, `/auth/refresh`, `/auth/logout`), Stripe webhook (`/webhooks/stripe`), health check |
| `crons.ts` | Scheduled jobs: hourly session cleanup, daily soft-delete purge |
| `convex.config.ts` | Convex app definition (minimal — auth configured in `auth.ts`) |
| `functions/products.ts` | Product CRUD, search, view counting with dedup |
| `functions/orders.ts` | Order management |
| `functions/cart.ts` | Shopping cart operations |
| `functions/users.ts` | User profile management, role changes |
| `functions/forum.ts` | Forum threads, posts, comments, reactions |
| `functions/stripe.ts` | Stripe webhook event recording, payment processing |
| `functions/webhooks.ts` | Webhook event handlers (checkout, payment, refund, dispute, connect) |
| `functions/sessions.ts` | Cross-subdomain session validation, refresh, revocation |
| `lib/middleware.ts` | Auth middleware wrappers: `authenticatedQuery`, `authenticatedMutation`, `adminQuery`, `adminMutation`, `sellerQuery`, `sellerMutation`, etc. |
| `lib/errors.ts` | `ErrorCode` enum + `createError()` factory for structured `ConvexError` |
| `lib/constants.ts` | Business limits: `PRODUCT_LIMITS`, `ORDER_LIMITS`, `USER_LIMITS`, `SLUG_PATTERN`, `SOFT_DELETE_CLEANUP` |
| `lib/security.ts` | Rate limiting (in-memory + DB-backed `checkRateLimitWithDb`), input validation, audit logging |
| `helpers/validation.ts` | String/email/URL/slug/password/file validators, injection detection |

---

## Frontend (per app)

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers (Convex, Theme) |
| `src/app/page.tsx` | Home page |
| `src/middleware.ts` | Next.js middleware: session check, security headers, CORS, CSP |
| `src/providers/convex-provider.tsx` | Convex client + auth provider setup |
| `src/lib/convex.ts` | Convex client instantiation |
| `src/app/api/auth/[...auth]/route.ts` | Convex Auth catch-all route handler |

---

## Shared UI (packages/ui/)

| File | Purpose |
|------|---------|
| `src/index.ts` | Barrel export of all shared components and hooks |
| `src/lib/utils.ts` | `cn()` — Tailwind class merging utility |
| `src/lib/schemas/` | Zod-like validation schemas for forum, order, product, review, user |
| `src/components/auth/` | `AuthProvider`, `ProtectedRoute`, `SessionSync`, `LoginRedirect` |

---

## Config (packages/config/)

| File | Purpose |
|------|---------|
| `eslint.config.mjs` | Shared ESLint 9 flat config |
| `tsconfig.base.json` | Base TypeScript config (strict mode, path aliases) |
| `tsconfig.nextjs.json` | Next.js TypeScript extensions |
| `tailwind.config.ts` | Shared Tailwind 4 config |
| `postcss.config.mjs` | PostCSS with Tailwind plugin |
| `vitest.config.ts` | Shared Vitest config |
| `security-headers.ts` | Shared security headers builder |
| `csp/` | Per-app Content Security Policy configs |

---

## Data Flow

1. **Client components** → `useQuery`/`useMutation` from `convex/react` with `api` from `@createconomy/convex`
2. **Server components** → `fetchQuery` from `convex/nextjs`
3. **All mutations** → Convex mutation functions (never direct DB writes from client)
4. **Stripe webhooks** → `POST /webhooks/stripe` → Convex HTTP action → internal mutations
5. **Cross-subdomain auth** → Custom session table + HTTP endpoints (`/auth/session`, `/auth/refresh`, `/auth/logout`)
6. **Cron jobs** → Hourly expired session cleanup, daily soft-delete record purge

---

## Related Docs

- [Architecture Overview](./architecture.md)
- [Data Models & Schema](./data-models.md)
- [API Reference](./api-reference.md)
