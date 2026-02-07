# Fix Admin App Vercel Deployment

## Problem Summary

The `@createconomy/admin` app fails to build on Vercel during the **static page prerendering** phase. All 6 deployment attempts are in ERROR state.

## Root Cause

The build fails at the `/_not-found` page prerender step with:

```
TypeError: Cannot read properties of undefined (reading 'replace')
```

This traces to [`packages/ui/src/components/auth/auth-provider.tsx:129`](../../packages/ui/src/components/auth/auth-provider.tsx:129):

```ts
const authBaseUrl = useMemo(() => {
  return convexUrl.replace(".convex.cloud", ".convex.site");
}, [convexUrl]);
```

### Why it fails on Vercel but not locally

1. During `next build`, Next.js prerenders the `/_not-found` page as static HTML
2. The `/_not-found` page renders inside the root layout, which includes `ConvexProvider`
3. `ConvexProvider` passes `process.env['NEXT_PUBLIC_CONVEX_URL']!` to `AuthProvider`'s `convexUrl` prop
4. On Vercel, if `NEXT_PUBLIC_CONVEX_URL` is not set as an environment variable, it resolves to `undefined`
5. The `AuthProvider` calls `.replace()` on `undefined`, causing the `TypeError`
6. Locally this works because the developer has `.env.local` with the value set

### Additional Issue: Middleware Deprecation Warning

The logs also show:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

This is a Next.js 16 deprecation warning that should be addressed but is not blocking the build.

## Fix Strategy

Two-pronged approach:

1. **Add defensive null-check** in `AuthProvider` so it handles missing `convexUrl` gracefully
2. **Add defensive null-check** in `convex-provider.tsx` to avoid passing `undefined` to `AuthProvider`

## Phases

- [Phase 01: Fix AuthProvider and ConvexProvider](./phase-01-fix-auth-provider.md) — Core code fixes
- [Phase 02: Verify Environment Variables](./phase-02-verify-env-vars.md) — Ensure Vercel project has required env vars
