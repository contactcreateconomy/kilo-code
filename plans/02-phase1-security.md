# Phase 1: Critical Security Fixes

## Finding S1: Insecure Session Token Generation - CRITICAL

**File**: [`packages/convex/convex/auth.ts`](../packages/convex/convex/auth.ts:565)

**Problem**: The `generateSessionToken()` function uses `Math.random()` which is NOT cryptographically secure. Session tokens generated this way are predictable and can be brute-forced. This is the single most severe vulnerability in the codebase.

**Root Cause**: `Math.random()` uses a PRNG seeded from a low-entropy source. An attacker who can observe a few tokens may predict future ones.

**Current Code**:
```typescript
function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `sess_${token}_${Date.now()}`;
}
```

**Fix**: Use `crypto.randomUUID()` or `crypto.getRandomValues()` available in the Convex runtime.

**Refactored Code**:
```typescript
function generateSessionToken(): string {
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  return `sess_${uuid1}${uuid2}`.replace(/-/g, '');
}
```

### Tasks
- [ ] Replace `generateSessionToken()` in `packages/convex/convex/auth.ts:565` with crypto-secure implementation
- [ ] Remove timestamp from token to avoid leaking timing information

---

## Finding S2: Unauthenticated Session Invalidation - CRITICAL

**File**: [`packages/convex/convex/auth.ts`](../packages/convex/convex/auth.ts:400)

**Problem**: The `invalidateSession` mutation accepts a raw token string and invalidates any session matching that token without verifying the caller is the session owner or an admin. Any user who obtains or guesses a session token can invalidate another user's session.

**Root Cause**: No ownership check before session invalidation.

**Current Code**:
```typescript
export const invalidateSession = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.patch(session._id, { isActive: false });
    }
    return true;
  },
});
```

**Fix**: Either require authentication and verify the session belongs to the caller, or make this an internal mutation only callable from trusted HTTP endpoints.

### Tasks
- [ ] Add authentication check to `invalidateSession` mutation
- [ ] Verify session ownership: caller must own the session or be admin
- [ ] Consider making session mutations `internalMutation` and only expose via HTTP endpoints

---

## Finding S3: HTTP Session Create Endpoint Accepts userId in Body - CRITICAL

**File**: [`packages/convex/convex/http.ts`](../packages/convex/convex/http.ts:167)

**Problem**: The `POST /auth/session` HTTP endpoint accepts `userId` directly from the request body. An attacker can create a session for any user by sending an arbitrary `userId`. This is an authentication bypass.

**Root Cause**: The endpoint trusts client-provided `userId` without verifying the caller has authenticated as that user.

**Current Code**:
```typescript
const body = await request.json();
const { userId, tenantId, userAgent, ipAddress } = body;
// ... creates session for userId without verification
```

**Fix**: This endpoint should only be callable after verifying the user has authenticated via Convex Auth. Remove the ability to pass `userId` in the body; instead derive it from the authenticated session.

### Tasks
- [ ] Remove `userId` from the POST body of `/auth/session`
- [ ] Require the caller to be authenticated via Convex Auth
- [ ] Derive `userId` from the authenticated context instead of request body

---

## Finding S4: Admin API Route Uses Clerk Instead of Convex Auth - CRITICAL

**File**: [`apps/admin/src/app/api/stripe/refund/route.ts`](../apps/admin/src/app/api/stripe/refund/route.ts:3)

**Problem**: The refund API route imports `getAuth` from `@clerk/nextjs/server`, but the project uses Convex Auth (not Clerk). This means the authentication check will always fail or throw, making the refund endpoint non-functional or potentially bypassed if Clerk returns a fallback.

**Root Cause**: Copy-paste from a different project or auth migration was incomplete.

**Current Code**:
```typescript
import { getAuth } from "@clerk/nextjs/server";
// ...
const { userId, sessionClaims } = getAuth(request);
```

**Fix**: Replace with Convex Auth session validation using the session cookie.

### Tasks
- [ ] Replace Clerk import with Convex Auth session validation
- [ ] Validate admin role via Convex `userProfiles` table
- [ ] Ensure the refund endpoint correctly authenticates and authorizes

---

## Finding S5: v.any() Used in Schema for Sensitive Fields - HIGH

**File**: [`packages/convex/convex/schema.ts`](../packages/convex/convex/schema.ts:238)

**Problem**: Multiple tables use `v.any()` for `metadata` fields: `products:238`, `orders:318`, `orderItems:349`, `stripeCustomers:649`, `stripePayments:679`, `sellers:740`, `stripeConnectAccounts:762`, `stripeDisputes:789`, `stripeWebhookEvents:700`. This bypasses Convex's type validation entirely, allowing arbitrary data injection.

**Root Cause**: Using `v.any()` as a convenience shortcut instead of defining proper validators.

**Fix**: Replace `v.any()` with specific validators or use `v.optional(v.record(v.string(), v.string()))` for truly dynamic metadata.

### Tasks
- [ ] Audit all `v.any()` usages in schema.ts
- [ ] Replace with specific validators where the shape is known
- [ ] Use `v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))` for dynamic metadata
- [ ] Update all mutations that write to these fields

---

## Finding S6: CSP Allows unsafe-eval and unsafe-inline - HIGH

**File**: [`packages/config/security-headers.ts`](../packages/config/security-headers.ts:122)

**Problem**: All CSP configurations include `'unsafe-inline'` and `'unsafe-eval'` in `script-src`. While Next.js requires `unsafe-inline` for its inline scripts, `unsafe-eval` significantly weakens CSP and should be avoided in production.

**Root Cause**: Blanket permissive CSP without using nonces.

**Fix**: Use nonce-based CSP with Next.js. Remove `'unsafe-eval'` where possible. Next.js supports `nonce` in CSP.

### Tasks
- [ ] Remove `'unsafe-eval'` from all CSP `script-src` directives
- [ ] Implement nonce-based CSP using Next.js middleware
- [ ] Replace `'unsafe-inline'` with `'nonce-...'` for script-src
- [ ] Keep `'unsafe-inline'` only for `style-src` if needed

---

## Finding S7: CORS Wildcard in Development Mode - HIGH

**File**: [`packages/convex/convex/auth.config.ts`](../packages/convex/convex/auth.config.ts:110)

**Problem**: In development mode, `getCorsHeaders()` falls through to set `Access-Control-Allow-Origin` to the raw `origin` or `*` for any request. Combined with `credentials: true`, this allows any website to make authenticated cross-origin requests to the Convex backend during development.

**Root Cause**: Overly permissive CORS fallback in dev.

**Fix**: Even in development, restrict CORS to known localhost origins.

### Tasks
- [ ] Remove wildcard CORS fallback in `getCorsHeaders()`
- [ ] Only allow specific localhost ports in development
- [ ] Ensure `credentials: true` is never paired with wildcard origin
