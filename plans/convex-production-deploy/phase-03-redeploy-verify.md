# Phase 03 — Vercel Redeployment & Verification

## Objective

Trigger redeployments of all 4 Vercel apps so they pick up the new production Convex environment variables, then verify end-to-end connectivity.

## Steps

### 3.1 Trigger Redeployments

After environment variables are set (Phase 02), each Vercel project must be redeployed for the new values to take effect. `NEXT_PUBLIC_*` variables are embedded at build time, so a rebuild is mandatory.

**Option A — Via Vercel Dashboard:**
1. Go to each project → Deployments tab.
2. Find the latest production deployment.
3. Click "..." → "Redeploy" → Confirm.

**Option B — Via Vercel CLI:**
```bash
vercel deploy --prod --project kilo-code-marketplace
vercel deploy --prod --project kilo-code-forum
vercel deploy --prod --project kilo-code-admin
vercel deploy --prod --project kilo-code-seller
```

**Option C — Via Vercel MCP deploy tool:**
Use `mcp--vercel--deploy_to_vercel` tool if available from the workspace context.

**Deploy sequentially** per the project rules — do not deploy all at once.

### 3.2 Monitor Build Logs

For each deployment, check the build logs to confirm:
1. No build errors.
2. `NEXT_PUBLIC_CONVEX_URL` is resolved (not empty or placeholder).
3. Build completes successfully.

Use `mcp--vercel--get_deployment_build_logs` with each deployment ID to inspect logs.

### 3.3 Verify Convex Function Sync

After Convex production deployment (Phase 01), verify all functions are synced:

1. **Use Convex MCP status tool** — Should show a `prod` deployment for the project.
2. **Use Convex MCP functionSpec tool** — Query the production deployment selector to verify all expected functions exist.
3. **Expected function count:** ~130+ functions across all modules.

Cross-reference against the dev deployment function list:

| Module | Expected Functions |
|--------|--------------------|
| auth.js | 15 |
| functions/admin.js | 12 |
| functions/cart.js | 7 |
| functions/categories.js | 8 |
| functions/forum.js | 26 |
| functions/orders.js | 6 |
| functions/products.js | 12 |
| functions/reviews.js | 7 |
| functions/sessions.js | 10 |
| functions/stripe.js | 20 |
| functions/users.js | 10 |
| functions/webhooks.js | 13 |
| lib/cleanup.js | 1 |
| HTTP routes | 18 |

### 3.4 Verify Environment Variable Configuration

**On Convex production:**
- Use `mcp--convex--envList` with the production deployment selector.
- Confirm `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `JWKS`, `JWT_PRIVATE_KEY`, `SITE_URL` are all set.
- Confirm `SITE_URL` points to the production `.convex.site` URL (not the dev one).

**On Vercel (per project):**
- Use `mcp--vercel--get_project` for each project ID.
- Verify `NEXT_PUBLIC_CONVEX_URL` = `https://quick-bison-433.convex.cloud` in production env.
- Verify `CONVEX_DEPLOY_KEY` is set for admin and seller projects.

### 3.5 Smoke Test Deployed Applications

For each deployed Vercel app:

1. **Hit the health endpoint** on the Convex production backend:
   - `GET https://quick-bison-433.convex.site/health`
   - Should return a successful response.

2. **Load each app in the browser** (or via `mcp--vercel--web_fetch_vercel_url`):
   - Marketplace: Check the homepage loads and can communicate with Convex.
   - Forum: Check category listing loads.
   - Admin: Check dashboard loads (may require auth).
   - Seller: Check portal loads (may require auth).

3. **Check browser console** for any Convex connection errors.

### 3.6 Verify Stripe Webhook Endpoint (Post-Deploy Follow-up)

The Stripe webhook endpoint URL changes with the production Convex deployment:
- **New webhook URL:** `https://quick-bison-433.convex.site/webhooks/stripe`
- This must be updated in the Stripe dashboard under Webhooks.
- This is a follow-up action outside the scope of Convex/Vercel deployment but critical for payment processing.

## Success Criteria

- [ ] All 4 Vercel apps redeployed to production successfully
- [ ] Convex production deployment shows all functions synced
- [ ] `NEXT_PUBLIC_CONVEX_URL` correctly set to `https://quick-bison-433.convex.cloud` across all apps
- [ ] Convex production env vars (OAuth, JWT, SITE_URL) are configured
- [ ] Health endpoint responds on production Convex site
- [ ] No Convex connection errors in deployed apps

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App shows placeholder Convex URL | Env var not set or not redeployed — redeploy after setting var |
| Convex connection timeout | Verify the production URL is correct and deployment is active |
| Auth flow broken | Check SITE_URL on Convex prod matches the `.convex.site` URL |
| Stripe webhooks failing | Update webhook URL in Stripe dashboard to production endpoint |
| Functions missing on prod | Re-run `npx convex deploy` from packages/convex |
