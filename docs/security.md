# Security

> Security measures for the Createconomy platform. See also [SECURITY.md](../SECURITY.md) for vulnerability reporting.

---

## Authentication & Authorization

### Auth flow

OAuth 2.0 (Google/GitHub) → Convex Auth → session cookie → cross-subdomain via `.createconomy.com` domain cookie.

Session config: HTTP-only, secure, `sameSite: lax`, 7-day TTL with sliding expiration. Token stored in `createconomy_session` cookie. Cross-subdomain auth uses custom `sessions` table + HTTP endpoints in `http.ts`.

### RBAC

| Role | Permissions |
|------|-------------|
| **User** | Browse, purchase, review, forum participation |
| **Seller** | User + product management, order fulfillment |
| **Admin** | All + user management, moderation, analytics |

Enforced via middleware wrappers in `packages/convex/convex/lib/middleware.ts`: `authenticatedQuery`, `adminMutation`, `sellerQuery`, etc.

---

## Data Protection

- **In transit**: TLS 1.3, HSTS with preload
- **At rest**: Convex encrypts all data at rest
- **Sensitive data**: Never log passwords, tokens, PII. Use redaction helpers.
- **Sessions**: 7-day TTL, automatic cleanup via hourly cron
- **Soft deletes**: 30-day retention before permanent purge via daily cron

---

## Security Headers

Configured in `packages/config/security-headers.ts` and per-app CSP in `packages/config/csp/`:

- `Strict-Transport-Security` (HSTS with preload)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (per-app, allows Convex + Stripe domains)
- `Permissions-Policy` (camera/mic/geo disabled)

---

## Rate Limiting

DB-backed via `rateLimitRecords` table and `checkRateLimitWithDb()` in `lib/security.ts`. Applied to auth endpoints, write mutations, and file uploads.

---

## Input Validation

- Convex argument validators on all functions (`v.string()`, `v.number()`, etc.)
- Business logic validation in handlers
- `v.any()` is banned — use typed validators
- XSS prevention via React's default escaping + sanitization for rich text

---

## Payment Security (Stripe)

- **No card data storage**: All payment data handled by Stripe Elements
- **Webhook verification**: `stripe.webhooks.constructEvent()` with signing secret
- **Tokenization**: Only payment tokens transmitted to server
- **Amount validation**: Server-side check before creating PaymentIntent

---

## Checklist for Contributors

- [ ] All inputs validated (Convex validators + business logic)
- [ ] Auth middleware on protected mutations/queries
- [ ] No sensitive data logged
- [ ] No hardcoded secrets
- [ ] `NEXT_PUBLIC_` prefix only for client-safe env vars
- [ ] CSRF protection on form submissions
- [ ] Rate limiting on write endpoints
