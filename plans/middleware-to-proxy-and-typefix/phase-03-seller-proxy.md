# Phase 03: Seller App — Middleware to Proxy Migration

## Objective

Migrate `apps/seller/src/middleware.ts` to the new Next.js 16 proxy convention.

## Current State

- **File**: [`apps/seller/src/middleware.ts`](../../apps/seller/src/middleware.ts)
- **Export**: `export function middleware(request: NextRequest)`
- **Config**: `export const config` with matcher pattern
- **Behavior**: Session-based auth guard for all non-public routes, CSP, security headers, CORS, robots noindex, OPTIONS preflight

## Changes Required

### Step 1: Create `apps/seller/src/proxy.ts`

Create the new file with the exact content of `middleware.ts` but rename the function:

```typescript
// Before
export function middleware(request: NextRequest) { ... }

// After  
export function proxy(request: NextRequest) { ... }
```

All route arrays (`publicRoutes`, `approvedSellerRoutes`), config export remain identical.

### Step 2: Delete `apps/seller/src/middleware.ts`

Remove the old file.

### Step 3: Clean `.next` cache

Delete `apps/seller/.next/` to clear stale build artifacts.

## Verification

- [ ] `apps/seller/src/proxy.ts` exists with `export function proxy()`
- [ ] `apps/seller/src/middleware.ts` no longer exists
- [ ] `apps/seller/.next/` is cleaned
- [ ] No other seller files reference the old middleware import

## Preserved Behavior

- Session cookie check (`createconomy_session`)
- Public routes: `/auth/signin`, `/auth/signup`, `/auth/signout`, `/auth/pending`, `/auth/callback`
- All other routes require authentication
- Unauthenticated users → redirect to `/auth/signin?redirect=<path>`
- Security headers: X-Frame-Options DENY, CSP, X-Robots-Tag noindex
- CORS headers for allowed origins
- OPTIONS preflight 204 response
- Seller role/approval verification deferred to client-side SellerGuard
