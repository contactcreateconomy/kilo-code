# Createconomy

> Digital marketplace platform connecting creators with consumers. Turborepo monorepo with four Next.js apps, Convex backend, Stripe payments.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9+ (strict) |
| Runtime | Node.js 24+, pnpm 10+ |
| Framework | Next.js 16 (App Router), React 19 |
| Backend | Convex 1.31+ (serverless DB + functions) |
| Auth | `@convex-dev/auth` (Google, GitHub OAuth) |
| Payments | Stripe Connect |
| Styling | Tailwind CSS 4 + Radix UI |
| Deployment | Vercel (per-app) |

---

## Monorepo Structure

```
apps/
  marketplace/   → Storefront           @createconomy/marketplace  :3000
  forum/         → Community forum       @createconomy/forum        :3001
  admin/         → Admin dashboard       @createconomy/admin        :3002
  seller/        → Seller portal         @createconomy/seller       :3003

packages/
  convex/        → Backend: schema, functions, auth     @createconomy/convex
  ui/            → Shared UI components, hooks, tokens  @createconomy/ui
  config/        → ESLint, TypeScript, Tailwind configs  @createconomy/config
```

---

## Quick Start

```bash
git clone https://github.com/contactcreateconomy/kilo-code.git
cd kilo-code
pnpm install
cp .env.example .env.local   # fill in values
cd packages/convex && npx convex dev --once && cd ../..
pnpm dev
```

| App | URL |
|-----|-----|
| Marketplace | http://localhost:3000 |
| Forum | http://localhost:3001 |
| Admin | http://localhost:3002 |
| Seller | http://localhost:3003 |

---

## Commands

| Task | Command |
|------|---------|
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

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `CONVEX_DEPLOYMENT` | Convex deployment identifier |
| `NEXT_PUBLIC_CONVEX_URL` | Public Convex URL |
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `AUTH_SECRET` | Auth secret (`openssl rand -base64 32`) |

See [docs/environment.md](./docs/environment.md) for full list.

---

## Deployment (Vercel)

Each app is a separate Vercel project. Build command: `cd ../.. && pnpm turbo build --filter=@createconomy/<app>`

| App | Domain |
|-----|--------|
| Marketplace | `createconomy.com` |
| Forum | `discuss.createconomy.com` |
| Admin | `console.createconomy.com` |
| Seller | `seller.createconomy.com` |

---

## Documentation

All docs in [`docs/`](./docs/):

| Document | Description |
|----------|-------------|
| [Architecture](./docs/architecture.md) | System design, data flow, auth flow |
| [Key Files](./docs/key-files.md) | Important file locations |
| [Data Models](./docs/data-models.md) | Database schema reference |
| [API Reference](./docs/api-reference.md) | Convex functions, HTTP endpoints |
| [Conventions](./docs/conventions.md) | Naming, imports, patterns |
| [Pitfalls](./docs/pitfalls.md) | Common mistakes |
| [Design System](./docs/design-system.md) | UI tokens, components, theming |
| [Security](./docs/security.md) | Auth, headers, rate limiting |
| [Deployment](./docs/deployment.md) | Vercel setup |
| [Environment](./docs/environment.md) | Env vars reference |
| [Contributing](./docs/contributing.md) | Branch naming, commits, PR process |
| [Troubleshooting](./docs/troubleshooting.md) | Common issues |
| [ADRs](./docs/adr/) | Architecture Decision Records |

---

## License

MIT — see [LICENSE](./LICENSE).
