# Environment & Configuration

> Environment variables and configuration files for the Createconomy platform.

---

## Required Environment Variables

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

---

## Application URLs

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_MARKETPLACE_URL` | `https://createconomy.com` |
| `NEXT_PUBLIC_FORUM_URL` | `https://discuss.createconomy.com` |
| `NEXT_PUBLIC_ADMIN_URL` | `https://console.createconomy.com` |
| `NEXT_PUBLIC_SELLER_URL` | `https://seller.createconomy.com` |

---

## Config Files

| File | Scope |
|------|-------|
| `.env.example` | Root env template — copy to `.env.local` |
| `apps/*/.env.example` | Per-app env templates |
| `.prettierrc` | Formatting rules |
| `packages/config/eslint.config.mjs` | Shared ESLint flat config |
| `packages/config/tsconfig.base.json` | Strict TS base (target ES2022, strict, noUncheckedIndexedAccess) |
| `packages/config/tsconfig.nextjs.json` | Next.js TS extensions |
| `packages/config/tailwind.config.ts` | Shared Tailwind config |
| `packages/config/postcss.config.mjs` | PostCSS with Tailwind plugin |
| `packages/config/vitest.config.ts` | Shared Vitest config |
| `packages/config/security-headers.ts` | Shared security headers builder |
| `packages/config/csp/` | Per-app Content Security Policy configs |
| `apps/*/vercel.json` | Per-app Vercel build/deploy config |

---

## Setup Instructions

### 1. Copy Environment Files

```bash
# Root level
cp .env.example .env.local

# Each app
cp apps/marketplace/.env.example apps/marketplace/.env.local
cp apps/forum/.env.example apps/forum/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/seller/.env.example apps/seller/.env.local
```

### 2. Configure Convex

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Create a new project
3. Copy the deployment URL to `NEXT_PUBLIC_CONVEX_URL`

```bash
cd packages/convex
npx convex dev
```

### 3. Configure Stripe (Optional for Development)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Dashboard
3. Set up Stripe Connect for the seller portal
4. Configure webhook endpoints

### 4. Configure OAuth

1. Google Cloud Console → create OAuth 2.0 credentials
2. GitHub Developer Settings → create OAuth App
3. Set redirect URIs:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://createconomy.com/api/auth/callback/google`

---

## Important Rules

- **Never** commit `.env` or `.env.local` files
- Client-exposed variables **must** be prefixed with `NEXT_PUBLIC_`
- All apps must share the same `AUTH_SECRET`
- Vercel projects require `ENABLE_EXPERIMENTAL_COREPACK=1` for pnpm 10+ support

---

## Related Docs

- [Local Development](./local-development.md)
- [Deployment Guide](./deployment.md)
- [Commands Reference](./commands.md)
