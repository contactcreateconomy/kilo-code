# Vercel Deployment Fixes Plan

## Summary

All 4 Createconomy Vercel projects have build failures caused by two categories of TypeScript/runtime errors. This plan documents the root causes, fixes, and deployment strategy.

## Deployment Status (Pre-Fix)

| Project | ID | Latest Deployment | State |
|---------|----|----|-------|
| kilo-code-forum | prj_UzQL101pimBiP6xLGy4w2iFu8YlK | dpl_FzUxzi2qGU318q9HBi2KUUmvyfiT | READY |
| kilo-code-marketplace | prj_zcQTsJTKyaZbhrXJFQy15ki9puAS | dpl_X24u7jrSyGMhzHoTvucs3YFuVms5 | ERROR |
| kilo-code-admin | prj_SF3MyxvddLptYaIGJHMGZh03zm23 | dpl_8n2NB2FQF3ZgGcw2DCsvpRp9uS5Y | ERROR |
| kilo-code-seller | prj_GIV7Uwoqn7cp6NeKuzCG6AdcPdLB | dpl_EvxdMyad4FZwrekDCH5yx2DxTaDQ | ERROR |

## Root Cause Analysis

### Error 1: TypeScript Index Signature Access - TS4111

**Affects:** marketplace, admin

**Error Message:**
```
Property 'NEXT_PUBLIC_CONVEX_URL' comes from an index signature, so it must be accessed with ['NEXT_PUBLIC_CONVEX_URL'].
```

**Root Cause:** TypeScript 5.9+ with `noUncheckedIndexedAccess` in strict mode requires bracket notation for `process.env` properties since `ProcessEnv` is an index-signature type. Dot notation like `process.env.NEXT_PUBLIC_CONVEX_URL` triggers TS4111.

**Files Affected:**
- `apps/marketplace/src/app/api/auth/[...auth]/route.ts` - Lines 81, 180, 228, 303
- `apps/marketplace/src/app/api/checkout/route.ts` - Line 12
- `apps/admin/src/app/api/auth/[...auth]/route.ts` - Lines 191, 239, 314
- `apps/admin/src/app/api/stripe/refund/route.ts` - Lines 22, 27, 64

**Fix:** Change `process.env.VAR_NAME!` to `process.env['VAR_NAME']!` across all affected files.

### Error 2: Stripe Top-Level Module Initialization Without API Key

**Affects:** seller, marketplace, admin

**Error Message (seller):**
```
Error: Neither apiKey nor config.authenticator provided
Error: Failed to collect page data for /api/stripe/connect
```

**Root Cause:** Stripe is initialized at module scope with `new Stripe(process.env['STRIPE_SECRET_KEY']!)`. During the Next.js build phase, environment variables like `STRIPE_SECRET_KEY` are not available because they are server-side only secrets not prefixed with `NEXT_PUBLIC_`. The Stripe constructor throws when receiving `undefined` as the API key.

Note: The marketplace build stopped at the TS4111 error before reaching the Stripe initialization issue. After fixing TS4111, the marketplace would hit this same Stripe error.

**Files Affected:**
- `apps/seller/src/app/api/stripe/connect/route.ts` - Line 12
- `apps/marketplace/src/app/api/checkout/route.ts` - Line 12
- `apps/admin/src/app/api/stripe/refund/route.ts` - Lines 22, 27

**Fix:** Use lazy initialization pattern - defer Stripe/Convex client creation to request time using a getter function:

```typescript
function getStripe() {
  return new Stripe(process.env['STRIPE_SECRET_KEY']!, {
    apiVersion: '2026-01-28.clover',
  });
}
```

Or use the Next.js `dynamic = 'force-dynamic'` export to prevent static generation of API routes.

### Additional Warnings - Not Blocking

1. **Middleware deprecation:** Next.js 16 warns that the middleware file convention is deprecated in favor of proxy. Not blocking builds.
2. **pnpm build scripts ignored:** esbuild, sharp, unrs-resolver build scripts skipped. Not blocking.
3. **lucia deprecated:** Subdependency warning. Not blocking.

## Phases

### Phase 1: Fix TypeScript Index Signature Errors

Change all `process.env.VAR_NAME` to `process.env['VAR_NAME']` in:

1. `apps/marketplace/src/app/api/auth/[...auth]/route.ts` - 4 occurrences
2. `apps/marketplace/src/app/api/checkout/route.ts` - 1 occurrence
3. `apps/admin/src/app/api/auth/[...auth]/route.ts` - 3 occurrences
4. `apps/admin/src/app/api/stripe/refund/route.ts` - 3 occurrences

### Phase 2: Fix Stripe Top-Level Initialization

Convert top-level Stripe/Convex client initialization to lazy initialization:

1. `apps/seller/src/app/api/stripe/connect/route.ts` - Stripe init at line 12
2. `apps/marketplace/src/app/api/checkout/route.ts` - Stripe init at line 12
3. `apps/admin/src/app/api/stripe/refund/route.ts` - Stripe init at line 22, Convex init at line 27

### Phase 3: Deploy and Verify

1. Trigger fresh deployments for all 4 projects
2. Monitor build logs for each
3. Confirm READY state

### Phase 4: Clean Up Old Deployments

Delete all old failed deployments, keeping only the latest successful one per project.

## Old Deployments to Delete

### Forum - 7 old deployments to delete
- dpl_4TPhBYWmabkKFpGQqVj47vSLNLnc - ERROR
- dpl_FbYjDkZMX7MiMCaDhGNZmQ1Q5nFp - ERROR
- dpl_BvNAP8a77ah1XAH2E4XFKHBiytvp - ERROR
- dpl_7Q8MEQt5DZkgqF2GfFfWdNg318Z4 - ERROR
- dpl_Dw2GxrGAsF9oGAp1y13fLoeGPtQK - ERROR
- dpl_GWdQeKVwStx4jowQ8uRsZoP2wsuS - ERROR
- dpl_5kndGewdvmV5CPZqGou4ueCjVaZt - ERROR

### Marketplace - 1 old deployment to delete
- dpl_2cCRY7P8e13LMDvGiKTJ1kB7b2eh - ERROR

### Admin - 1 old deployment to delete
- dpl_6Bv2B7KruFQTRuCspARwz3PmHB3X - ERROR

### Seller - 1 old deployment to delete
- dpl_26sC59gzNfk1f1xtjvuLwR51WJwj - ERROR
