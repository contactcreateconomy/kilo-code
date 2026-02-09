# Convex Production Deployment & Vercel Integration

## Summary

Deploy the Convex backend to production, configure environment variables across all 4 Vercel apps, and verify end-to-end connectivity.

## Current State

| Component | Status |
|-----------|--------|
| **Convex Dev Deployment** | ✅ Active at `https://merry-skunk-642.convex.cloud` |
| **Convex Prod Deployment** | ✅ `https://quick-bison-433.convex.cloud` |
| **Vercel Team** | ✅ `Createconomy` (`team_ibAJ8nGIN2J1nDIznFd00UA7`) |
| **Vercel Projects** | ✅ 4 projects exist (marketplace, seller, forum, admin) |
| **Vercel Env Vars** | ❌ Not yet configured for production Convex |

### Convex Dev Environment Variables (currently set)

- `AUTH_GOOGLE_ID` — Google OAuth client ID
- `AUTH_GOOGLE_SECRET` — Google OAuth secret
- `JWKS` — JSON Web Key Set for auth
- `JWT_PRIVATE_KEY` — JWT signing private key
- `SITE_URL` — `https://merry-skunk-642.convex.site`

### Vercel Projects

| App | Project ID | Vercel Project Name |
|-----|-----------|-------------------|
| Marketplace | `prj_zcQTsJTKyaZbhrXJFQy15ki9puAS` | `kilo-code-marketplace` |
| Seller | `prj_GIV7Uwoqn7cp6NeKuzCG6AdcPdLB` | `kilo-code-seller` |
| Forum | `prj_UzQL101pimBiP6xLGy4w2iFu8YlK` | `kilo-code-forum` |
| Admin | `prj_SF3MyxvddLptYaIGJHMGZh03zm23` | `kilo-code-admin` |

### Convex Functions (synced to dev)

- **auth.js** — 15 functions (session mgmt, signIn, signOut, OAuth)
- **functions/admin.js** — 12 functions (dashboard stats, user/seller/order mgmt)
- **functions/cart.js** — 7 functions (cart CRUD)
- **functions/categories.js** — 8 functions (category CRUD)
- **functions/forum.js** — 26 functions (threads, posts, comments, reactions)
- **functions/orders.js** — 6 functions (order mgmt)
- **functions/products.js** — 12 functions (product CRUD, search)
- **functions/reviews.js** — 7 functions (review CRUD)
- **functions/sessions.js** — 10 functions (cross-subdomain session mgmt)
- **functions/stripe.js** — 20 functions (checkout, Connect, payments, refunds)
- **functions/users.js** — 10 functions (user profiles, roles)
- **functions/webhooks.js** — 13 internal mutations (Stripe webhook handlers)
- **lib/cleanup.js** — 1 internal mutation
- **HTTP routes** — 18 endpoints (auth, webhooks, JWKS, health)

## Phase Files

1. [Phase 01 — Convex Production Deploy](./phase-01-convex-deploy.md)
2. [Phase 02 — Vercel Environment Variables](./phase-02-vercel-env-vars.md)
3. [Phase 03 — Vercel Redeployment & Verification](./phase-03-redeploy-verify.md)

## Key Risks & Considerations

1. **`npx convex deploy` requires authentication** — The CLI must be logged in to Convex. If not already authenticated, `npx convex login` is needed first.
2. **Deploy key generation** — After deploying to prod, a `CONVEX_DEPLOY_KEY` must be generated from the Convex dashboard or CLI for server-side operations.
3. **Environment variable parity** — The production Convex deployment needs the same env vars as dev (OAuth keys, JWKS, JWT_PRIVATE_KEY, SITE_URL) but with production values.
4. **`SITE_URL` changes** — Production will have a different `.convex.site` URL than dev.
5. **All 4 Vercel apps share one Convex backend** — They all need identical `NEXT_PUBLIC_CONVEX_URL` pointing to the production Convex deployment.
6. **Stripe webhook endpoints** — Must be updated in the Stripe dashboard to point to the production Convex HTTP endpoint URL.
7. **Sequential operations required** — Convex must be deployed before Vercel env vars can be set, and Vercel must be redeployed after env vars are configured.
