# Phase 03: Fix Google Login for Seller and Admin Apps

## Goal
Ensure Google OAuth login works correctly for the admin and seller apps, matching the working patterns used by the forum and marketplace apps.

---

## Problem Analysis

### How Google Login Works in Forum & Marketplace (working)

Both apps follow the same pattern:

1. **`useAuth` hook** provides `signInWithGoogle()` method
2. `signInWithGoogle` calls `convexSignIn("google", { redirectTo: siteUrl })`
3. `siteUrl` is derived from `NEXT_PUBLIC_SITE_URL` env var or `window.location.origin`
4. After Google OAuth completes, Convex redirects back to the app's origin
5. The `ConvexAuthProvider` handles the OAuth callback automatically

**Key code in working apps:**
```typescript
const signInWithGoogle = async () => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
  await convexSignIn("google", { redirectTo: siteUrl });
};
```

### Admin App — Issues Found

**Issue 1: Different sign-in pattern**

The admin [`sign-in-form.tsx`](../../apps/admin/src/components/auth/sign-in-form.tsx) uses `useAuthActions` directly instead of going through a `useAuth` hook:

```typescript
const { signIn } = useAuthActions();
await signIn('google', { redirectTo: '/' });
```

The problem: `redirectTo: '/'` is a relative path, not an absolute URL. After Google OAuth, Convex needs to redirect back to the full URL of the admin app. A relative path `/` could cause the redirect to fail or land on the wrong domain.

**Issue 2: Missing `useAuth` pattern consistency**

The admin [`use-auth.ts`](../../apps/admin/src/hooks/use-auth.ts) hook does NOT expose `signInWithGoogle`/`signInWithGitHub`/`signOut` methods — it only exposes read-only state. The sign-in form bypasses the hook entirely.

**Issue 3: No `NEXT_PUBLIC_SITE_URL` usage**

Admin sign-in doesn't use `NEXT_PUBLIC_SITE_URL` to construct the redirect URL, unlike the working apps.

### Seller App — Issues Found

**Issue 1: Pattern looks correct, but needs env var**

The seller app's [`use-auth.ts`](../../apps/seller/src/hooks/use-auth.ts) follows the same pattern as forum/marketplace:

```typescript
const signInWithGoogle = useCallback(async () => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
  await convexSignIn("google", { redirectTo: siteUrl });
}, [convexSignIn]);
```

This pattern is correct. The potential issue is that `NEXT_PUBLIC_SITE_URL` may not be set in the seller app's `.env.local`, causing the fallback to `window.location.origin` — which should work in development (`http://localhost:3003`) but could fail if there's a mismatch.

**Issue 2: Google One Tap component exists but may not trigger correctly**

The seller app has a [`google-one-tap.tsx`](../../apps/seller/src/components/auth/google-one-tap.tsx) component that independently handles Google sign-in. It calls `signInWithGoogle()` from the same hook, but the One Tap flow uses a different mechanism (credential response → then calls signInWithGoogle anyway). This could cause double-redirect issues.

---

## Tasks

### Task 1: Fix Admin Sign-In Form to Use Correct Pattern

**Files to modify:**
- [`apps/admin/src/hooks/use-auth.ts`](../../apps/admin/src/hooks/use-auth.ts)
- [`apps/admin/src/components/auth/sign-in-form.tsx`](../../apps/admin/src/components/auth/sign-in-form.tsx)

**Changes to `use-auth.ts`:**
1. Import `useAuthActions` from `@convex-dev/auth/react`
2. Add `signInWithGoogle`, `signOut` methods matching forum/marketplace pattern
3. Use `NEXT_PUBLIC_SITE_URL` for redirect URL

```typescript
// Add to useAuth() hook
const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();

const signInWithGoogle = useCallback(async () => {
  const siteUrl = process.env['NEXT_PUBLIC_SITE_URL'] ?? window.location.origin;
  await convexSignIn("google", { redirectTo: siteUrl });
}, [convexSignIn]);

const signOut = useCallback(async () => {
  await convexSignOut();
}, [convexSignOut]);
```

**Changes to `sign-in-form.tsx`:**
1. Use `useAuth` hook instead of `useAuthActions` directly
2. Use the shared `AdminSignInForm` component but wire it through `useAuth().signInWithGoogle`

```typescript
export function SignInForm() {
  const { signInWithGoogle } = useAuth();

  return (
    <SharedAdminSignInForm
      onGoogleSignIn={async () => {
        await signInWithGoogle();
      }}
    />
  );
}
```

---

### Task 2: Verify Seller Google Login Environment Variable

**File:** [`apps/seller/.env.example`](../../apps/seller/.env.example)

**Required changes:**
1. Ensure `NEXT_PUBLIC_SITE_URL` is documented in `.env.example`
2. Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set (needed for Google One Tap)
3. Verify the seller app's `.env.local` has the correct values

Example `.env.example` entries:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

### Task 3: Verify Admin Google Login Environment Variable

**File:** [`apps/admin/.env.example`](../../apps/admin/.env.example)

**Required changes:**
1. Add `NEXT_PUBLIC_SITE_URL` to `.env.example`
2. Ensure admin app's `.env.local` sets it to `http://localhost:3002` for dev

---

### Task 4: Verify Google OAuth Redirect URIs in Google Console

**Not a code change — manual verification:**

The Google OAuth consent screen must have ALL app URLs listed as authorized redirect URIs:

- `http://localhost:3000` (marketplace)
- `http://localhost:3001` (forum)
- `http://localhost:3002` (admin)
- `http://localhost:3003` (seller)

And for production:
- `https://createconomy.com`
- `https://discuss.createconomy.com`
- `https://console.createconomy.com`
- `https://seller.createconomy.com`

Also verify the Convex Auth configuration allows redirects to all these origins.

---

### Task 5: Verify Convex Auth Configuration

**File:** Check `packages/convex/convex/auth.config.ts` or equivalent

Ensure the Google provider is configured and the redirect URLs include all app domains. The Convex auth config typically handles this via the `SITE_URL` or `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` environment variables on the Convex deployment.

---

### Task 6: Test Google Login Flow End-to-End

After implementing changes, test:

1. **Admin app:** Navigate to `http://localhost:3002/auth/signin` → Click "Continue with Google" → Should redirect to Google → Should redirect back to admin dashboard → User should be authenticated with admin role check
2. **Seller app:** Navigate to `http://localhost:3003/auth/signin` → Click Google button → Should redirect to Google → Should redirect back to seller dashboard → User should be authenticated with seller role check
3. **Cross-tab sync:** Sign in on marketplace → Open admin in another tab → Should detect existing session
4. **Sign out:** Sign out on admin → Should clear session → Should redirect to sign-in page

---

## Validation Checklist
- [ ] Admin sign-in form uses `useAuth` hook with `NEXT_PUBLIC_SITE_URL`
- [ ] Admin Google login redirects correctly back to admin app
- [ ] Seller Google login redirects correctly back to seller app
- [ ] `NEXT_PUBLIC_SITE_URL` documented in both `.env.example` files
- [ ] Google OAuth redirect URIs include all 4 app URLs
- [ ] Cross-subdomain session sync works after Google login
- [ ] Sign-out works correctly on both apps
- [ ] `pnpm typecheck` passes for both apps
