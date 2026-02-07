# Phase 02: Marketplace App — Middleware to Proxy Migration

## Objective

Migrate `apps/marketplace/src/middleware.ts` to the new Next.js 16 proxy convention.

## Current State

- **File**: [`apps/marketplace/src/middleware.ts`](../../apps/marketplace/src/middleware.ts)
- **Export**: `export function middleware(request: NextRequest)`
- **Config**: `export const config` with matcher pattern
- **Behavior**: Session-based auth for protected routes, public routes pass-through, security headers, CORS, OPTIONS preflight

## Changes Required

### Step 1: Create `apps/marketplace/src/proxy.ts`

Create the new file with the exact content of `middleware.ts` but rename the function:

```typescript
// Before
export function middleware(request: NextRequest) { ... }

// After  
export function proxy(request: NextRequest) { ... }
```

All helper functions (`matchesRoute`), route arrays, config export remain identical.

### Step 2: Delete `apps/marketplace/src/middleware.ts`

Remove the old file.

### Step 3: Clean `.next` cache

Delete `apps/marketplace/.next/` to clear stale build artifacts.

## Verification

- [ ] `apps/marketplace/src/proxy.ts` exists with `export function proxy()`
- [ ] `apps/marketplace/src/middleware.ts` no longer exists
- [ ] `apps/marketplace/.next/` is cleaned
- [ ] No other marketplace files reference the old middleware import

## Preserved Behavior

- Session cookie check (`createconomy_session`)
- Public routes: `/`, `/products`, `/categories`, `/search`, `/auth/*`
- Protected routes: `/account`, `/checkout`, `/orders`, `/wishlist`, `/messages`
- Unauthenticated users on protected routes → redirect to `/auth/signin?redirect=<path>`
- Security headers: SAMEORIGIN framing, nosniff, referrer policy, permissions policy
- CORS headers for allowed cross-subdomain origins
- OPTIONS preflight 204 response
