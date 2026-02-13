# Troubleshooting

> Common issues and solutions. For commands reference see [commands.md](./commands.md).

---

## Development

### `pnpm install` fails

```bash
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000 && kill -9 <PID>
```

### Convex connection fails

1. Start Convex dev: `cd packages/convex && npx convex dev`
2. Verify `.env.local` has `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`
3. Check Convex dashboard for deployment status

### Hot reload not working

```bash
rm -rf .next
pnpm dev
```

Also try: Ctrl+Shift+R in browser, or restart TS server in VS Code (`Cmd/Ctrl+Shift+P` → "TypeScript: Restart TS Server").

### TypeScript errors in IDE but build succeeds

Restart TS server or run `pnpm typecheck` to realign.

---

## Build

### Out of memory (OOM)

`pnpm build` runs all 4 apps in parallel and can OOM on Windows. Build individually:

```bash
pnpm --filter @createconomy/marketplace build
pnpm --filter @createconomy/forum build
pnpm --filter @createconomy/admin build
pnpm --filter @createconomy/seller build
```

Or increase heap: `NODE_OPTIONS="--max-old-space-size=4096" pnpm build`

### Turbo cache stale

```bash
pnpm turbo clean
pnpm build --force
```

### Module not found

1. Check import paths (use `@/` alias for intra-app, `@createconomy/*` for packages)
2. Run `pnpm install`
3. Verify `tsconfig.json` path aliases

---

## Authentication

### OAuth redirect fails (`Invalid redirect_uri`)

1. Check OAuth provider settings (Google Cloud Console / GitHub Developer Settings)
2. Verify redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev) or `https://createconomy.com/api/auth/callback/google` (prod)
3. Confirm `AUTH_SECRET` is set

### Cross-domain auth not working

1. Cookie domain must be `.createconomy.com` in production
2. `sameSite: "lax"` required
3. All apps must share the same `AUTH_SECRET`
4. Remember: auth uses custom `sessions` table + HTTP endpoints in `http.ts`, not Next.js cookies

### User logged out unexpectedly

- Session may have expired (7-day TTL)
- `refreshSession` rotates tokens — clients must update stored tokens
- Clear cookies and re-login

---

## Database (Convex)

### Schema changes not applying

```bash
cd packages/convex
npx convex dev --once   # dev
npx convex deploy       # prod
```

Schema changes require `npx convex dev` running or generated types drift.

### Query returns `undefined`

`undefined` = still loading. `null` = not found. Handle both:

```typescript
const data = useQuery(api.functions.getData, { id });
if (data === undefined) return <Loading />;
if (data === null) return <NotFound />;
```

---

## Payments (Stripe)

### Payment fails silently

1. Check Stripe Dashboard for error details
2. Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Check webhook logs

### Webhooks not received locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Verify `STRIPE_WEBHOOK_SECRET=whsec_...` matches the CLI output.

---

## Deployment (Vercel)

### Build fails on Vercel

1. Check build logs in Vercel Dashboard
2. Verify all env vars are set (especially `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`)
3. Build command: `cd ../.. && pnpm turbo build --filter=@createconomy/<app>`

### Env vars not available client-side

Prefix with `NEXT_PUBLIC_`: e.g. `NEXT_PUBLIC_CONVEX_URL`. Redeploy after adding new vars.

---

## Logs

| Context | Location |
|---------|----------|
| Next.js (dev) | Terminal running `pnpm dev` |
| Convex functions | Convex Dashboard → Logs, or `npx convex logs --follow` |
| Browser | DevTools → Console / Network |
| Vercel (prod) | Vercel Dashboard → Logs |
