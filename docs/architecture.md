# Architecture Overview

> Technical architecture for the Createconomy platform.

---

## System Overview

```
Clients (Browser)
       │
  Vercel Edge Network
       │
  ┌────┼────┬────┬────┐
  │    │    │    │    │
  v    v    v    v    │
 Market Forum Admin Seller
 :3000  :3001 :3002 :3003
  │    │    │    │
  └────┴──┬─┴────┘
          │
     Convex Cloud
  (Functions + Database + Auth + File Storage)
          │
  External Services (Stripe, OAuth, Email)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React 19, Tailwind 4 | SSR, routing, UI |
| Backend | Convex 1.31+ | Database, serverless functions, real-time |
| Auth | Convex Auth + custom sessions | OAuth, cross-subdomain sessions |
| Payments | Stripe (Connect) | Payments, seller payouts |
| Deploy | Vercel | Hosting, edge functions |
| Build | Turborepo + pnpm | Monorepo management |

---

## Application Structure

### Apps

| App | Port | Route Examples |
|-----|------|----------------|
| `apps/marketplace` | 3000 | `/products`, `/cart`, `/checkout`, `/account/orders` |
| `apps/forum` | 3001 | `/c/[slug]`, `/t/[id]`, `/u/[username]`, `/leaderboard` |
| `apps/admin` | 3002 | `/users`, `/products`, `/orders`, `/moderation`, `/analytics` |
| `apps/seller` | 3003 | `/products`, `/orders`, `/analytics`, `/payouts`, `/settings` |

Each app follows the same structure:
- `src/app/` — Next.js App Router pages/layouts
- `src/components/` — app-specific UI
- `src/hooks/` — app-specific hooks
- `src/providers/` — Convex/auth provider wiring

### Shared Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@createconomy/ui` | `packages/ui/` | Design system, shared components, hooks |
| `@createconomy/config` | `packages/config/` | ESLint, TS, Tailwind, security headers |
| `@createconomy/convex` | `packages/convex/` | Schema, functions, generated API |

---

## Backend Domain Architecture

Convex functions follow a **layered domain architecture**. Each domain is extracted into `packages/convex/convex/lib/<domain>/`:

```
packages/convex/convex/
├── functions/          # Thin orchestration handlers (API surface)
│   ├── forum.ts        # Delegates to lib/forum/
│   ├── products.ts     # Delegates to lib/products/
│   ├── orders.ts       # Delegates to lib/orders/
│   └── users.ts        # Delegates to lib/users/
├── lib/
│   ├── shared/         # Cross-cutting utilities
│   │   ├── author.ts       # enrichAuthor(), enrichAuthorBatch()
│   │   ├── authorization.ts # requireOwnerOrModAdmin(), requireOwnerOrAdmin()
│   │   └── pagination.ts    # paginateWithCursor()
│   ├── forum/          # Forum domain
│   │   ├── forum.types.ts       # EnrichedThread, CommentTreeNode, etc.
│   │   ├── forum.repository.ts  # All DB reads/writes (~25 functions)
│   │   ├── forum.policies.ts    # canEditThread, canDeletePost, etc.
│   │   ├── forum.service.ts     # Slug generation, scoring, sorting
│   │   └── forum.mappers.ts     # toThreadListItem, toCommentTree, etc.
│   ├── products/       # Same layered pattern
│   ├── orders/         # Reference implementation (first extracted)
│   ├── users/          # Same layered pattern
│   ├── policies.ts     # Shared policy helpers
│   ├── middleware.ts    # Auth wrappers (authenticatedQuery, adminMutation, etc.)
│   └── errors.ts       # createError(ErrorCode, message)
```

### Layer Responsibilities

| Layer | File Pattern | Responsibility |
|-------|-------------|----------------|
| **Types** | `*.types.ts` | Domain type definitions |
| **Repository** | `*.repository.ts` | All database access (reads and writes) |
| **Policies** | `*.policies.ts` | Authorization predicates |
| **Service** | `*.service.ts` | Pure business logic (no DB access) |
| **Mappers** | `*.mappers.ts` | Response shaping for API consumers |

Function files in `convex/functions/*.ts` are thin orchestration layers (15-30 lines per handler) that compose these modules. All exported function names are preserved — the Convex API surface is unchanged.

See `docs/adr/` for decision records: ADR-002 (domain boundaries), ADR-005 (forum extraction), ADR-006 (shared enrichment).

---

## Data Flow

### Reads (Real-time Queries)

```
Client Component → useQuery() → Convex Query Function → Database
       ↑                                    │
       └────── Real-time Subscription ──────┘
```

### Writes (Mutations)

```
Client Action → useMutation() → Convex Mutation → Validation/Auth → Database
```

### Server-Side

Next.js server components can call Convex via `fetchQuery()` for SSR.

---

## Authentication Flow

1. User clicks Sign In → OAuth redirect to Google/GitHub
2. Provider callback → Convex Auth creates user + session
3. Session cookie set on `.createconomy.com` domain
4. Cross-subdomain: all 4 apps share the session via domain cookie
5. Custom `sessions` table + HTTP endpoints in `http.ts` manage session lifecycle (`createSession`, `refreshSession`, `revokeSession`)

### Role-Based Access Control

| Role | Access |
|------|--------|
| User | Browse, purchase, review, forum participation |
| Seller | + product management, order fulfillment |
| Moderator | + content moderation, user warnings |
| Admin | + all management, analytics, role changes |

Auth middleware wrappers: `authenticatedQuery`, `authenticatedMutation`, `sellerMutation`, `adminMutation`, etc. in `lib/middleware.ts`.

---

## Payment Flow

```
Cart → Checkout → Stripe Elements → Payment Intent
                                          │
                                          ▼
                   Webhook Handler → Order Created → Download Available
```

### Stripe Connect (Seller Payouts)

- Platform takes fee (configurable %)
- Remainder transferred to seller's Stripe Connect account
- Webhooks: `payment_intent.succeeded`, `payout.paid`, `charge.refunded`

---

## Multi-Tenancy

- Seller data isolation via `sellerId` filtering on products/orders
- Optional `tenantId` on most tables for future multi-tenant support
- Admin can access all records; sellers only their own
- Authorization enforced via `assertProductOwnership()` and similar policy functions

---

## Performance

| Strategy | Implementation |
|----------|----------------|
| Real-time | Convex subscriptions auto-invalidate on writes |
| Static pages | Next.js static generation where possible |
| Edge caching | Vercel CDN for static assets |
| Batch dedup | `enrichAuthorBatch()` deduplicates user lookups in list views |
| Cursor pagination | `paginateWithCursor()` for all list endpoints |

---

## Related Docs

- [API Reference](./api-reference.md) | [Data Models](./data-models.md) | [Security](./security.md)
- [Conventions](./conventions.md) | [Deployment](./deployment.md) | [Troubleshooting](./troubleshooting.md)
- ADRs: `docs/adr/001-006`
