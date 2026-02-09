# Phase 02 — Vercel Environment Variables

## Objective

Update all 4 Vercel projects with the production Convex URL and related environment variables so the Next.js apps connect to the production Convex backend.

## Production Values

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://quick-bison-433.convex.cloud` |
| `CONVEX_DEPLOY_KEY` | *(generated from Convex dashboard — see Phase 01 step 1.5)* |

## Environment Variables Per App

### All 4 Apps (marketplace, forum, admin, seller)

These must be set on **every** Vercel project in the **production** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://quick-bison-433.convex.cloud` | Client-side Convex connection |

### Admin & Seller Apps Only

These apps reference `CONVEX_DEPLOY_KEY` in their `.env.example` files for server-side Convex operations:

| Variable | Value | Notes |
|----------|-------|-------|
| `CONVEX_DEPLOY_KEY` | *(from Convex dashboard)* | Server-side deploy key |

## Steps

### 2.1 Set Environment Variables on kilo-code-marketplace

**Project ID:** `prj_zcQTsJTKyaZbhrXJFQy15ki9puAS`

Set in Vercel production environment:
- `NEXT_PUBLIC_CONVEX_URL` = `https://quick-bison-433.convex.cloud`

### 2.2 Set Environment Variables on kilo-code-forum

**Project ID:** `prj_UzQL101pimBiP6xLGy4w2iFu8YlK`

Set in Vercel production environment:
- `NEXT_PUBLIC_CONVEX_URL` = `https://quick-bison-433.convex.cloud`

### 2.3 Set Environment Variables on kilo-code-admin

**Project ID:** `prj_SF3MyxvddLptYaIGJHMGZh03zm23`

Set in Vercel production environment:
- `NEXT_PUBLIC_CONVEX_URL` = `https://quick-bison-433.convex.cloud`
- `CONVEX_DEPLOY_KEY` = *(from Phase 01 step 1.5)*

### 2.4 Set Environment Variables on kilo-code-seller

**Project ID:** `prj_GIV7Uwoqn7cp6NeKuzCG6AdcPdLB`

Set in Vercel production environment:
- `NEXT_PUBLIC_CONVEX_URL` = `https://quick-bison-433.convex.cloud`
- `CONVEX_DEPLOY_KEY` = *(from Phase 01 step 1.5)*

## Implementation Method

Use the Vercel dashboard or Vercel CLI to set these environment variables. Since we are in Architect mode, the Code mode implementor should:

1. Navigate to each Vercel project Settings → Environment Variables.
2. Add each variable scoped to **Production** environment only.
3. Or use the Vercel CLI:

```bash
# For each project
vercel env add NEXT_PUBLIC_CONVEX_URL production --project kilo-code-marketplace
# Enter value: https://quick-bison-433.convex.cloud

vercel env add NEXT_PUBLIC_CONVEX_URL production --project kilo-code-forum
vercel env add NEXT_PUBLIC_CONVEX_URL production --project kilo-code-admin
vercel env add NEXT_PUBLIC_CONVEX_URL production --project kilo-code-seller

# Admin and seller also need deploy key
vercel env add CONVEX_DEPLOY_KEY production --project kilo-code-admin
vercel env add CONVEX_DEPLOY_KEY production --project kilo-code-seller
```

## Verification

After setting all variables, confirm via Vercel dashboard that each project shows:
- `NEXT_PUBLIC_CONVEX_URL` = `https://quick-bison-433.convex.cloud` (Production)
- `CONVEX_DEPLOY_KEY` set for admin and seller (Production)
