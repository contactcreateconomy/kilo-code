# Phase 01: Fix AuthProvider and ConvexProvider

## Error Analysis

```
Error occurred prerendering page "/_not-found"
TypeError: Cannot read properties of undefined (reading 'replace')
    at <unknown> (.next/server/chunks/ssr/[root-of-the-server]__931e9ddd._.js:1:4726)
```

### Call Chain During Prerender

```
Root Layout (layout.tsx)
  └── ThemeProvider (client component — safe, just uses localStorage)
      └── ConvexProvider (convex-provider.tsx)
          └── ConvexProviderBase (safe — uses placeholder URL)
              └── ConvexAuthProvider (safe)
                  └── AuthProvider (convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!)
                      └── useMemo: convexUrl.replace(...) ← CRASH HERE
```

The `!` non-null assertion on line 51 of `convex-provider.tsx` tells TypeScript to trust that the value exists, but at runtime during SSR prerendering, `process.env['NEXT_PUBLIC_CONVEX_URL']` is `undefined`.

---

## Fix 1: `packages/ui/src/components/auth/auth-provider.tsx`

**File:** [`packages/ui/src/components/auth/auth-provider.tsx`](../../packages/ui/src/components/auth/auth-provider.tsx)
**Line:** 126-130

### Current Code

```typescript
const authBaseUrl = useMemo(() => {
  // Convert Convex URL to HTTP URL
  // e.g., https://xxx.convex.cloud -> https://xxx.convex.site
  return convexUrl.replace(".convex.cloud", ".convex.site");
}, [convexUrl]);
```

### Fixed Code

```typescript
const authBaseUrl = useMemo(() => {
  if (!convexUrl) {
    return "";
  }
  // Convert Convex URL to HTTP URL
  // e.g., https://xxx.convex.cloud -> https://xxx.convex.site
  return convexUrl.replace(".convex.cloud", ".convex.site");
}, [convexUrl]);
```

### Why This Fix Works

- During prerendering on Vercel, `convexUrl` can be `undefined` or empty
- Adding a guard prevents the `TypeError`
- Auth features wont work without a real URL, but the page will at least render
- At runtime in the browser, the env var will be available and auth works normally

---

## Fix 2: `apps/admin/src/providers/convex-provider.tsx`

**File:** [`apps/admin/src/providers/convex-provider.tsx`](../../apps/admin/src/providers/convex-provider.tsx)
**Line:** 51

### Current Code

```typescript
<AuthProvider
  convexUrl={process.env['NEXT_PUBLIC_CONVEX_URL']!}
  onAuthError={handleAuthError}
>
```

### Fixed Code

```typescript
<AuthProvider
  convexUrl={process.env['NEXT_PUBLIC_CONVEX_URL'] ?? 'https://placeholder.convex.cloud'}
  onAuthError={handleAuthError}
>
```

### Why This Fix Works

- Removes the dangerous `!` non-null assertion
- Provides a fallback URL matching the pattern used on line 14 for `ConvexReactClient`
- The placeholder URL will correctly `.replace()` to `https://placeholder.convex.site`
- No actual network requests succeed with a placeholder, but the build completes

---

## Compatibility Notes

- Both fixes are defensive and mutually compatible
- Fix 1 protects ALL apps using `AuthProvider` from the shared UI package
- Fix 2 specifically protects the admin app's provider
- Neither fix changes runtime behavior when `NEXT_PUBLIC_CONVEX_URL` is properly set
- The fixes follow the same pattern already used in [`convex-provider.tsx:14`](../../apps/admin/src/providers/convex-provider.tsx:14) for the `ConvexReactClient`

---

## Verification After Deploy

After implementing these fixes, the build should:

1. **Compile successfully** — TypeScript compilation passes as before
2. **Prerender `/_not-found`** — No more `TypeError` during static generation
3. **Complete build** — All 19 pages generated

The middleware deprecation warning will remain but is non-blocking.
