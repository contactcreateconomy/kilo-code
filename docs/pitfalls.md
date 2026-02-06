# Common Pitfalls & Known Issues

> Things to watch out for when working on the Createconomy platform.

---

## Critical Pitfalls

1. **`convex/_generated/` is auto-generated.** Never edit files in this directory. Run `npx convex dev` to regenerate.

2. **Schema changes require `npx convex dev` running.** If you modify `schema.ts`, Convex dev must be running to regenerate types, otherwise type errors will cascade.

3. **Prices are in cents.** All `price`, `total`, `amount` fields are integers in cents. Use `centsToDollars()` / `dollarsToCents()` from `lib/stripe.ts` for display/conversion.

4. **Soft-delete only.** Products, reviews, forum threads/posts/comments use `isDeleted: true` + `deletedAt`. Queries must filter `isDeleted: false`. A daily cron permanently removes records >30 days old.

5. **`v.any()` is banned in the schema.** All metadata fields use `metadataValidator` (record of string→string|number|boolean|null). The `stripeWebhookEvents.payload` is stored as a JSON string, not an object.

6. **Middleware wrappers vs. manual auth.** New Convex functions should use `authenticatedQuery`, `adminMutation`, `sellerQuery` etc. from `lib/middleware.ts`. Some older functions still call `getAuthUserId(ctx)` manually — both patterns coexist.

7. **Cross-subdomain auth uses a custom sessions table** — not Next.js cookies directly. The `sessions` table + HTTP endpoints in `http.ts` manage this. Session token is in `createconomy_session` cookie.

8. **Session token rotation.** `refreshSession` generates a new token on each refresh. Clients must update stored tokens.

9. **Rate limiting is DB-backed** via `rateLimitRecords` table and `checkRateLimitWithDb()`. In-memory rate limiting also exists in `lib/security.ts` but is less durable across Convex function restarts.

10. **Vercel build command** for each app uses `cd ../.. && pnpm turbo build --filter=@createconomy/<app>`. Do not change this without updating `vercel.json`.

11. **Turbopack is the default bundler** for Next.js 16. Webpack config in `next.config.ts` only applies to production builds.

12. **ESLint strict type-checked mode is on** but many `@typescript-eslint/no-unsafe-*` rules are relaxed to `off`. `@typescript-eslint/no-explicit-any` is `warn`, not `error`.

---

## Related Docs

- [Troubleshooting](./troubleshooting.md)
- [Conventions & Patterns](./conventions.md)
- [Data Models & Schema](./data-models.md)
