# Createconomy — AI Agent Reference

## 1. Project Overview

Createconomy is a multi-tenant digital marketplace platform connecting creators (sellers) with consumers, built as a Turborepo monorepo with four Next.js 16 apps sharing a Convex serverless backend and Stripe Connect payments. Supports four user roles: `customer`, `seller`, `moderator`, `admin`.

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.9+ |
| Runtime | Node.js | 24+ |
| Package Manager | pnpm | 10+ (10.28.2 pinned) |
| Monorepo | Turborepo | 2.8+ |
| Framework | Next.js (App Router) | 16.1+ |
| React | React | 19.2+ |
| Backend | Convex (serverless DB + functions) | 1.31+ |
| Auth | `@convex-dev/auth` (Google, GitHub OAuth) | 0.0.90+ |
| Payments | Stripe Connect + `stripe` SDK | 20.3+ |
| Styling | Tailwind CSS 4 + `tailwind-merge` | 4.1+ |
| UI Primitives | Radix UI | various |
| State (marketplace) | Zustand | 5.0+ |
| Animations (forum) | Framer Motion | 12.31+ |
| Charts (admin/seller) | Recharts | 2.15+ |
| Testing | Vitest + React Testing Library | 4.0+ / 16.3+ |
| Linting | ESLint 9 + typescript-eslint | 9.39+ |
| Formatting | Prettier + prettier-plugin-tailwindcss | 3.8+ |
| Deployment | Vercel (per-app) | — |

## 3. Architecture Summary

### Monorepo Layout

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

### Per-App Structure

Each Next.js app follows:
```
src/
  app/           → App Router pages, layouts, route groups, API routes
  components/    → App-specific components (auth/, layout/, domain/)
  hooks/         → App-specific hooks
  lib/           → Utilities (convex.ts, stripe.ts, utils.ts)
  providers/     → Context providers (convex-provider.tsx, theme-provider.tsx)
  types/         → Type definitions
  middleware.ts  → Route protection, security headers, CORS
```

### Data Flow

1. **Client components** → `useQuery`/`useMutation` from `convex/react` with `api` from `@createconomy/convex`
2. **Server components** → `fetchQuery` from `convex/nextjs`
3. **All mutations** → Convex mutation functions (never direct DB writes from client)
4. **Stripe webhooks** → `POST /webhooks/stripe` → Convex HTTP action → internal mutations
5. **Cross-subdomain auth** → Custom session table + HTTP endpoints (`/auth/session`, `/auth/refresh`, `/auth/logout`)
6. **Cron jobs** → Hourly expired session cleanup, daily soft-delete record purge

## 4. Key Files & Entry Points

### Backend (packages/convex/convex/)

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

### Frontend (per app)

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers (Convex, Theme) |
| `src/app/page.tsx` | Home page |
| `src/middleware.ts` | Next.js middleware: session check, security headers, CORS, CSP |
| `src/providers/convex-provider.tsx` | Convex client + auth provider setup |
| `src/lib/convex.ts` | Convex client instantiation |
| `src/app/api/auth/[...auth]/route.ts` | Convex Auth catch-all route handler |

### Shared UI (packages/ui/)

| File | Purpose |
|------|---------|
| `src/index.ts` | Barrel export of all shared components and hooks |
| `src/lib/utils.ts` | `cn()` — Tailwind class merging utility |
| `src/lib/schemas/` | Zod-like validation schemas for forum, order, product, review, user |
| `src/components/auth/` | `AuthProvider`, `ProtectedRoute`, `SessionSync`, `LoginRedirect` |

### Config (packages/config/)

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

## 5. Conventions & Patterns

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-profile.tsx`, `auth-guard.tsx` |
| Components | PascalCase | `UserProfile`, `AuthGuard` |
| Hooks | camelCase + `use` prefix | `useAuth`, `useCart` |
| Constants | SCREAMING_SNAKE_CASE | `PRODUCT_LIMITS`, `SESSION_CONFIG` |
| Variables/Functions | camelCase | `getProduct`, `handleClick` |
| Slugs | lowercase + hyphens | `my-product-2024` (validated by `SLUG_PATTERN`) |

### Imports

- Use path alias `@/` for intra-app imports (maps to `./src/`)
- Import shared UI: `import { Button } from '@createconomy/ui'`
- Import Convex API: `import { api } from '@createconomy/convex'`
- Import Convex hooks: `import { useQuery, useMutation } from 'convex/react'`
- Use `type` imports: `import type { Id } from './_generated/dataModel'`
- ESLint enforces `consistent-type-imports` with `inline-type-imports` style

### React & Next.js

- Server Components by default; add `'use client'` only when needed
- Use `use()` hook instead of `useContext()` (React 19)
- Do not use `forwardRef`; pass `ref` as a regular prop (React 19)
- No class components — functional components with hooks only
- Each app wraps children in `ThemeProvider` → `ConvexProvider` in root layout

### Convex Patterns

- `query` for reads, `mutation` for writes, `action` for external API calls
- Use auth middleware wrappers from `lib/middleware.ts` (`authenticatedQuery`, `adminMutation`, `sellerQuery`, etc.) — these inject `ctx.userId` automatically
- User-facing errors: `throw createError(ErrorCode.NOT_FOUND, 'message')` from `lib/errors.ts`
- System errors: plain `throw new Error('message')` — never reaches client
- Queries returning "not found": return `null` (not an error)
- Soft-delete pattern: set `isDeleted: true, deletedAt: Date.now()` — never hard-delete from client code
- Rate limiting: use `checkRateLimitWithDb()` in mutations — writes to `rateLimitRecords` table
- All prices stored in **cents** (integer). Use `lib/stripe.ts` helpers for conversion.

### Formatting

- Prettier config in `.prettierrc`: single quotes, semicolons, 100 char line width, trailing commas (es5)
- `prettier-plugin-tailwindcss` auto-sorts Tailwind classes
- Run `pnpm format` before committing

## 6. Data Models & Schema

Schema defined in `packages/convex/convex/schema.ts`. All tables include `createdAt`/`updatedAt` (epoch ms). Multi-tenant tables have optional `tenantId`.

### Core Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `users` | (from `@convex-dev/auth` authTables) | — |
| `userProfiles` | `userId`, `username`, `defaultRole`, `isBanned` | → `users` |
| `tenants` | `name`, `slug`, `domain`, `subdomain` | — |
| `userTenants` | `userId`, `tenantId`, `role` | → `users`, `tenants` |
| `sessions` | `userId`, `token`, `expiresAt`, `isActive` | → `users` |

### Commerce Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `products` | `sellerId`, `name`, `slug`, `price` (cents), `status`, `isDeleted` | → `users`, `productCategories` |
| `productCategories` | `name`, `slug`, `parentId` | self-referential hierarchy |
| `productImages` | `productId`, `url`, `isPrimary`, `sortOrder` | → `products` |
| `productViews` | `productId`, `viewerId`, `viewedAt` | → `products` |
| `orders` | `userId`, `orderNumber`, `status`, `total` (cents) | → `users` |
| `orderItems` | `orderId`, `productId`, `sellerId`, `price`, `quantity` | → `orders`, `products`, `users` |
| `carts` | `userId`, `sessionId`, `subtotal`, `itemCount` | → `users` |
| `cartItems` | `cartId`, `productId`, `quantity`, `price` | → `carts`, `products` |
| `reviews` | `productId`, `userId`, `rating`, `isApproved`, `isDeleted` | → `products`, `users` |
| `sellers` | `userId`, `businessName`, `stripeAccountId`, `isApproved` | → `users` |

### Forum Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `forumCategories` | `name`, `slug`, `threadCount`, `postCount` | self-referential via `parentId` |
| `forumThreads` | `categoryId`, `authorId`, `title`, `slug`, `isPinned`, `isLocked`, `isDeleted` | → `forumCategories`, `users` |
| `forumPosts` | `threadId`, `authorId`, `content`, `status`, `isDeleted` | → `forumThreads`, `users` |
| `forumComments` | `postId`, `authorId`, `parentId`, `isDeleted` | → `forumPosts`, `users`, self-referential |
| `forumReactions` | `userId`, `targetType`, `targetId`, `reactionType` | → `users` |
| `forumTags` / `forumThreadTags` | tag + thread junction | → `forumThreads` |
| `userPoints` | `userId`, `totalPoints`, `level`, `badges` | → `users` |
| `forumCampaigns` | `title`, `prize`, `targetPoints`, `isActive` | — |

### Stripe Tables

| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| `stripeCustomers` | `userId`, `stripeCustomerId` | → `users` |
| `stripePayments` | `userId`, `orderId`, `stripePaymentIntentId`, `status` | → `users`, `orders` |
| `stripeWebhookEvents` | `stripeEventId`, `type`, `processed`, `payload` (JSON string) | — |
| `stripeConnectAccounts` | `sellerId`, `stripeAccountId`, `onboardingComplete` | → `sellers` |
| `stripeDisputes` | `paymentId`, `stripeDisputeId`, `status` | → `stripePayments` |

### Other

| Table | Purpose |
|-------|---------|
| `rateLimitRecords` | DB-backed sliding-window rate limiting. Key = `"action:identifier"` |

### Search Indexes

- `products.search_products` — full-text on `name`, filters: `tenantId`, `categoryId`, `status`, `isDeleted`
- `forumThreads.search_threads` — full-text on `title`, filters: `tenantId`, `categoryId`, `isDeleted`

## 7. Commands Reference

| Task | Command | Notes |
|------|---------|-------|
| Install deps | `pnpm install` | Must use pnpm 10+. Do NOT use npm/yarn. |
| Dev all apps | `pnpm dev` | Runs all apps via Turborepo |
| Dev single app | `pnpm --filter @createconomy/marketplace dev` | Replace with app name |
| Dev Convex backend | `cd packages/convex && npx convex dev` | Required for type generation and live sync |
| Build all | `pnpm build` | |
| Build single app | `pnpm --filter @createconomy/admin build` | |
| Lint all | `pnpm lint` | |
| Typecheck all | `pnpm typecheck` | |
| Format all | `pnpm format` | Prettier + Tailwind sort |
| Format check | `pnpm format:check` | CI-friendly |
| Test all | `pnpm test` | Vitest |
| Test with coverage | `pnpm test:coverage` | |
| Test watch | `pnpm test:watch` | |
| Clean all | `pnpm clean` | Removes .turbo, .next, node_modules |
| Deploy Convex | `cd packages/convex && npx convex deploy` | |
| Deploy app to Vercel | Per-app Vercel project | Each app has own `vercel.json` |

## 8. Environment & Configuration

### Required Environment Variables

| Variable | Used By | Description |
|----------|---------|-------------|
| `CONVEX_DEPLOYMENT` | All apps + Convex | Convex deployment identifier |
| `NEXT_PUBLIC_CONVEX_URL` | All apps | Convex client URL (public) |
| `STRIPE_SECRET_KEY` | Backend + apps | Stripe server-side key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Marketplace, Seller | Stripe client-side key |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook signature secret |
| `STRIPE_CONNECT_CLIENT_ID` | Backend | Stripe Connect platform ID |
| `AUTH_SECRET` | All apps | Auth.js secret |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Backend | Google OAuth credentials |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Backend | GitHub OAuth credentials (optional) |
| `NEXT_PUBLIC_MARKETPLACE_URL` | All apps | `https://createconomy.com` |
| `NEXT_PUBLIC_FORUM_URL` | All apps | `https://discuss.createconomy.com` |
| `NEXT_PUBLIC_ADMIN_URL` | All apps | `https://console.createconomy.com` |
| `NEXT_PUBLIC_SELLER_URL` | All apps | `https://seller.createconomy.com` |

### Config Files

| File | Scope |
|------|-------|
| `.env.example` | Root env template — copy to `.env.local` |
| `apps/*/.env.example` | Per-app env templates |
| `.prettierrc` | Formatting rules |
| `packages/config/eslint.config.mjs` | Shared ESLint flat config |
| `packages/config/tsconfig.base.json` | Strict TS base (target ES2022, strict, noUncheckedIndexedAccess) |
| `packages/config/tsconfig.nextjs.json` | Next.js TS extensions |
| `packages/config/tailwind.config.ts` | Shared Tailwind config |
| `apps/*/vercel.json` | Per-app Vercel build/deploy config |

## 9. Common Pitfalls & Known Issues

1. **`convex/_generated/` is auto-generated.** Never edit files in this directory. Run `npx convex dev` to regenerate.
2. **Schema changes require `npx convex dev` running.** If you modify `schema.ts`, Convex dev must be running to regenerate types, otherwise type errors will cascade.
3. **Prices are in cents.** All `price`, `total`, `amount` fields are integers in cents. Use `centsToDollars()` / `dollarsToCents()` from `lib/stripe.ts` for display/conversion.
4. **Soft-delete only.** Products, reviews, forum threads/posts/comments use `isDeleted: true` + `deletedAt`. Queries must filter `isDeleted: false`. A daily cron permanently removes records >30 days old.
5. **`v.any()` is banned in the schema.** All metadata fields use `metadataValidator` (record of string→string|number|boolean|null). The `stripeWebhookEvents.payload` is stored as a JSON string, not an object.
6. **Middleware wrappers vs. manual auth.** New Convex functions should use `authenticatedQuery`, `adminMutation`, `sellerQuery` etc. from `lib/middleware.ts`. Some older functions still call `getAuthUserId(ctx)` manually — both patterns coexist.
7. **Cross-subdomain auth uses a custom sessions table** — not Next.js cookies directly. The `sessions` table + HTTP endpoints in `http.ts` manage this. Session token is in `createconomy_session` cookie.
8. **Session token rotation.** `refreshSession` generates a new token on each refresh. Clients must update stored tokens.
9. **Rate limiting is DB-backed** via `rateLimitRecords` table and `checkRateLimitWithDb()`. In-memory rate limiting also exists in `lib/security.ts` but is less durable across Convex function restarts.
10. **Vercel build command** for each app uses `cd ../.. && pnpm turbo build --filter=@createconomy/<app>`. Do not change this without updating `vercel.json`.
11. **Turbopack is the default bundler** for Next.js 16. Webpack config in `next.config.ts` only applies to production builds.
12. **ESLint strict type-checked mode is on** but many `@typescript-eslint/no-unsafe-*` rules are relaxed to `off`. `@typescript-eslint/no-explicit-any` is `warn`, not `error`.

## 10. Rules of Engagement

### Always

- Use TypeScript with strict mode. No `any` types.
- Handle loading and error states in all UI components.
- Validate all user inputs — both via Convex argument validators and business logic in handlers.
- Use Convex for all data operations. Never write to DB from client or Next.js API routes directly.
- Use `createError(ErrorCode.*, message)` for all user-facing errors in Convex functions.
- Follow established file structure: shared → `packages/ui`, app-specific → `apps/<app>/src/components`.
- Prefix client-exposed env vars with `NEXT_PUBLIC_`.
- Run `pnpm format` and `pnpm typecheck` before committing.
- Use auth middleware wrappers for new Convex functions (`authenticatedQuery`, `adminMutation`, etc.).
- Use `isDeleted: true` for deletion. Never hard-delete user-facing records.

### Never

- Edit `convex/_generated/` files.
- Use `var`. Use `const` or `let`.
- Use deprecated React APIs (`forwardRef`, `useContext` — use `ref` prop and `use()` instead).
- Hardcode environment-specific values. Use env vars.
- Use `v.any()` in schema validators. Use `metadataValidator` or a specific typed validator.
- Commit `.env` / `.env.local` files.
- Use npm/yarn. Only pnpm.
- Bypass Convex for data mutations (no direct REST API writes).
- Store prices in dollars/floats. Always cents (integer).
- Log sensitive data (passwords, tokens, PII) in Convex functions.
