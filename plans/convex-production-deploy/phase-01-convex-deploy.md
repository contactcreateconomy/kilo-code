# Phase 01 — Convex Production Deploy

## Objective

Deploy all Convex functions, schema, and HTTP routes to the production environment and configure production-specific environment variables on the Convex deployment.

## Prerequisites

- Convex CLI authenticated (`npx convex login` if not already)
- Access to Convex dashboard for the `merry-skunk-642` project
- Production values for OAuth credentials, JWT keys, and Stripe secrets

## Steps

### 1.1 Verify Convex CLI Authentication

```bash
cd packages/convex && npx convex whoami
```

- If not authenticated, run `npx convex login` and complete the browser-based auth flow.
- Confirm the logged-in user has access to the `merry-skunk-642` project.

### 1.2 Deploy Convex Functions to Production

```bash
cd packages/convex && npx convex deploy
```

- This pushes all functions, schema, and HTTP routes to the **production** deployment.
- The CLI will output the production deployment URL (format: `https://<deployment-name>.convex.cloud`).
- **Capture the production URL** — it will be needed for all subsequent steps.
- The production `.convex.site` URL will also be generated (format: `https://<deployment-name>.convex.site`).

### 1.3 Verify Deployment Success

After `npx convex deploy` completes:

1. Check the CLI output for any errors or warnings.
2. Verify all function modules were deployed:
   - `auth.js`
   - `functions/admin.js`
   - `functions/cart.js`
   - `functions/categories.js`
   - `functions/forum.js`
   - `functions/orders.js`
   - `functions/products.js`
   - `functions/reviews.js`
   - `functions/sessions.js`
   - `functions/stripe.js`
   - `functions/users.js`
   - `functions/webhooks.js`
   - `lib/cleanup.js`
   - HTTP routes (18 endpoints)

3. Use the Convex MCP status tool to confirm the production deployment appears:
   - Should now show both `ownDev` and `prod` deployments.

### 1.4 Set Production Environment Variables on Convex

The production Convex deployment needs these environment variables set. Use the Convex dashboard or CLI:

```bash
cd packages/convex
npx convex env set AUTH_GOOGLE_ID <production-google-client-id> --prod
npx convex env set AUTH_GOOGLE_SECRET <production-google-secret> --prod
npx convex env set JWKS <production-jwks-json> --prod
npx convex env set JWT_PRIVATE_KEY <production-jwt-private-key> --prod
npx convex env set SITE_URL <production-convex-site-url> --prod
```

**Important decisions:**
- **Same OAuth credentials?** If the Google OAuth app is configured for both dev and prod redirect URIs, the same credentials can be reused. Otherwise, new credentials are needed.
- **Same JWT keys?** For security best practice, production should use **different** JWT keys than development. Run `node packages/convex/generateKeys.mjs` to generate a new key pair if needed.
- **`SITE_URL`** must be set to the production `.convex.site` URL (obtained from the deploy output).

### 1.5 Generate CONVEX_DEPLOY_KEY

The `CONVEX_DEPLOY_KEY` is needed by the admin and seller apps for server-side Convex operations:

1. Go to [Convex Dashboard](https://dashboard.convex.dev) → Production deployment → Settings → Deploy Key.
2. Generate a new deploy key.
3. **Save this key securely** — it will be used in Phase 02 for Vercel environment variables.

## Outputs

| Output | Description |
|--------|-------------|
| Production Convex URL | `https://<prod-deployment>.convex.cloud` |
| Production Convex Site URL | `https://<prod-deployment>.convex.site` |
| CONVEX_DEPLOY_KEY | Generated deploy key for server-side access |
| Function sync status | All 130+ functions deployed and synced |

## Rollback

If the production deployment has issues:
- Convex supports deployment rollback from the dashboard.
- The development deployment is unaffected by production deploys.
