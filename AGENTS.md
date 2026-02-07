# Createconomy — AI Agent Reference

> Multi-tenant digital marketplace connecting creators with consumers. Turborepo monorepo with four Next.js 16 apps, Convex serverless backend, and Stripe Connect payments.

For detailed documentation, see the [`docs/`](./docs/) folder.

---

## Quick Reference

| | |
|---|---|
| **Roles** | `customer`, `seller`, `moderator`, `admin` |
| **Language** | TypeScript 5.9+ (strict mode) |
| **Runtime** | Node.js 24+, pnpm 10+ (**never** npm/yarn) |
| **Framework** | Next.js 16.1+ (App Router), React 19.2+ |
| **Backend** | Convex 1.31+ (serverless DB + functions) |
| **Auth** | `@convex-dev/auth` (Google, GitHub OAuth) |
| **Payments** | Stripe Connect + `stripe` SDK 20.3+ |
| **Styling** | Tailwind CSS 4 + Radix UI |
| **Deployment** | Vercel (per-app) |

📖 Full stack details → [docs/tech-stack.md](./docs/tech-stack.md)

---

## Monorepo Layout

```
apps/
  marketplace/   → Main storefront        @createconomy/marketplace  port 3000
  forum/         → Community discussions   @createconomy/forum        port 3001
  admin/         → Admin dashboard         @createconomy/admin        port 3002
  seller/        → Seller portal           @createconomy/seller       port 3003

packages/
  convex/        → Backend: schema, functions, auth, HTTP routes  @createconomy/convex
  ui/            → Shared UI components, hooks, schemas, utils    @createconomy/ui
  config/        → Shared ESLint, TypeScript, Tailwind, PostCSS, Vitest, CSP configs  @createconomy/config
```

📖 Key files & entry points → [docs/key-files.md](./docs/key-files.md)

---

## Essential Commands

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Dev all apps | `pnpm dev` |
| Dev single app | `pnpm --filter @createconomy/marketplace dev` |
| Dev Convex backend | `cd packages/convex && npx convex dev` |
| Build all | `pnpm build` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Format | `pnpm format` |
| Test | `pnpm test` |
| Deploy Convex | `cd packages/convex && npx convex deploy` |

📖 Full commands → [docs/commands.md](./docs/commands.md)

---

## Conventions (Summary)

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Hooks | `use` prefix | `useAuth` |
| Constants | SCREAMING_SNAKE_CASE | `PRODUCT_LIMITS` |

**Imports**: `@/` for intra-app, `@createconomy/ui` for shared UI, `@createconomy/convex` for API.

**React 19**: Use `use()` not `useContext()`. Use `ref` prop not `forwardRef`. Server Components by default.

**Convex**: Use middleware wrappers (`authenticatedQuery`, `adminMutation`, `sellerQuery`, etc.) from `lib/middleware.ts`. Errors: `createError(ErrorCode.*, message)` from `lib/errors.ts`.

📖 Full conventions → [docs/conventions.md](./docs/conventions.md)

---

## Data Model (Summary)

Schema defined in `packages/convex/convex/schema.ts`. All tables have `createdAt`/`updatedAt` (epoch ms).

**Core**: `users`, `userProfiles`, `tenants`, `userTenants`, `sessions`
**Commerce**: `products`, `productCategories`, `productImages`, `orders`, `orderItems`, `carts`, `cartItems`, `reviews`, `sellers`
**Forum**: `forumCategories`, `forumThreads`, `forumPosts`, `forumComments`, `forumReactions`, `forumTags`, `userPoints`
**Stripe**: `stripeCustomers`, `stripePayments`, `stripeWebhookEvents`, `stripeConnectAccounts`, `stripeDisputes`
**Other**: `rateLimitRecords`

📖 Full schema → [docs/data-models.md](./docs/data-models.md)

---

## Critical Rules

### Always

- TypeScript strict mode. No `any` types.
- All data ops through Convex. Never direct DB writes from client.
- User-facing errors: `createError(ErrorCode.*, message)`.
- Prices in **cents** (integer). Use `centsToDollars()`/`dollarsToCents()`.
- Soft-delete: `isDeleted: true, deletedAt: Date.now()`. Never hard-delete.
- Validate all inputs (Convex validators + business logic).
- `pnpm format` and `pnpm typecheck` before committing.
- Prefix client env vars with `NEXT_PUBLIC_`.

### Never

- Edit `convex/_generated/` files.
- Use `var`, `forwardRef`, `useContext`, `v.any()`.
- Commit `.env` / `.env.local` files.
- Use npm/yarn. Only pnpm.
- Store prices in dollars/floats.
- Log sensitive data (passwords, tokens, PII).

---

## Key Pitfalls

1. Schema changes require `npx convex dev` running or types break.
2. Cross-subdomain auth uses custom `sessions` table + HTTP endpoints — not Next.js cookies.
3. `refreshSession` rotates tokens — clients must update stored tokens.
4. Rate limiting is DB-backed via `rateLimitRecords` + `checkRateLimitWithDb()`.
5. Vercel build command: `cd ../.. && pnpm turbo build --filter=@createconomy/<app>`.
6. Turbopack is default bundler; webpack config only applies to production builds.

📖 All pitfalls → [docs/pitfalls.md](./docs/pitfalls.md)

---

## Documentation Index

All detailed docs live in the [`docs/`](./docs/) folder:

| Document | Description |
|----------|-------------|
| [Tech Stack](./docs/tech-stack.md) | Complete technology versions and details |
| [Architecture](./docs/architecture.md) | System diagrams, data flow, auth flow, payment flow |
| [Key Files](./docs/key-files.md) | Important file locations and entry points |
| [Data Models](./docs/data-models.md) | Full database schema reference |
| [Conventions](./docs/conventions.md) | Naming, imports, React/Convex patterns, rules |
| [Pitfalls](./docs/pitfalls.md) | Common mistakes and known issues |
| [Commands](./docs/commands.md) | CLI commands reference |
| [Environment](./docs/environment.md) | Environment variables and config files |
| [API Reference](./docs/api-reference.md) | Convex functions, HTTP endpoints, error codes |
| [Security](./docs/security.md) | Auth, CSRF, rate limiting, headers, payment security |
| [Deployment](./docs/deployment.md) | Vercel setup, CI/CD, branch protection |
| [Local Development](./docs/local-development.md) | Setup guide, debugging, IDE config |
| [Contributing](./docs/contributing.md) | Branch naming, commits, PR process, coding standards |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues and solutions |

See also: [README.md](./README.md) for project overview and quick start.
