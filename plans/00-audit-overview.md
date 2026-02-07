# Createconomy Codebase Audit — Master Plan

## Overview

This document is the master index for a comprehensive audit and refactoring plan for the Createconomy monorepo. The audit was conducted against:
- Project coding standards defined in [AGENTS.md](../AGENTS.md)
- Vercel React Best Practices skill — 57 rules
- Vercel Composition Patterns skill
- Web Design Guidelines skill
- Convex best practices from official documentation

## Severity Summary

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 4 | Immediate security vulnerabilities that can be actively exploited |
| HIGH | 9 | Significant bugs, security gaps, or performance issues |
| MEDIUM | 10 | Code quality issues, missing validations, duplicated logic |
| LOW | 5 | Minor improvements, cleanup, future-proofing |

**Total findings: 28**

## Phase Structure

Each phase is documented in its own file for manageable implementation:

| Phase | File | Focus | Findings |
|-------|------|-------|----------|
| Phase 0 | [01-phase0-cleanup.md](01-phase0-cleanup.md) | Remove unused Docker files | 1 item |
| Phase 1 | [02-phase1-security.md](02-phase1-security.md) | Critical security fixes | S1-S7 — 7 findings |
| Phase 2 | [03-phase2-bugs.md](03-phase2-bugs.md) | Bug fixes and logic errors | B1-B6 — 6 findings |
| Phase 3 | [04-phase3-performance.md](04-phase3-performance.md) | Performance optimizations | P1-P6 — 6 findings |
| Phase 4 | [05-phase4-code-quality.md](05-phase4-code-quality.md) | Code quality and TypeScript | CQ1-CQ7 — 7 findings |
| Phase 5 | [06-phase5-architecture.md](06-phase5-architecture.md) | Architecture improvements | A1-A7 — 7 findings |

## Execution Order

Phases should be executed in numerical order. Within each phase, findings are ordered by severity — highest first.

```
Phase 0: Cleanup         → Quick wins, no risk
Phase 1: Security        → Fix exploitable vulnerabilities first
Phase 2: Bugs            → Fix correctness issues before optimizing
Phase 3: Performance     → Improve efficiency of correct code
Phase 4: Code Quality    → Improve maintainability
Phase 5: Architecture    → Structural improvements for long-term health
```

## Critical Findings Quick Reference

These MUST be fixed before any production deployment:

1. **S1** — Session tokens use `Math.random()` — predictable tokens
2. **S2** — Session invalidation has no ownership check — anyone can log out anyone
3. **S3** — HTTP session endpoint accepts arbitrary `userId` — authentication bypass
4. **S4** — Admin refund API uses Clerk auth instead of Convex Auth — broken auth

## Key Files Requiring Changes

| File | Findings | Priority |
|------|----------|----------|
| `packages/convex/convex/auth.ts` | S1, S2, P5, A4 | CRITICAL |
| `packages/convex/convex/http.ts` | S3, B2, B3 | CRITICAL |
| `apps/admin/src/app/api/stripe/refund/route.ts` | S4 | CRITICAL |
| `packages/convex/convex/schema.ts` | S5 | HIGH |
| `packages/convex/convex/functions/admin.ts` | CQ1, P1, P4 | HIGH |
| `packages/convex/convex/functions/orders.ts` | B1, B5, CQ2 | HIGH |
| `packages/convex/convex/functions/products.ts` | P2, P3, A5 | MEDIUM |
| `packages/convex/convex/functions/stripe.ts` | B5, A2 | MEDIUM |
| `packages/convex/convex/functions/users.ts` | B6 | MEDIUM |
| `packages/convex/convex/helpers/validation.ts` | CQ3, A3 | MEDIUM |
| `packages/convex/convex/helpers/multitenancy.ts` | CQ4 | MEDIUM |
| `packages/convex/convex/lib/security.ts` | CQ3, A3 | MEDIUM |
| `packages/config/security-headers.ts` | S6 | HIGH |
| `packages/convex/convex/auth.config.ts` | S7 | HIGH |

## New Files to Create

| File | Purpose | Phase |
|------|---------|-------|
| `packages/convex/convex/lib/middleware.ts` | Auth wrapper functions | Phase 5 |
| `packages/convex/convex/lib/order-utils.ts` | Centralized order number generation | Phase 5 |
| `packages/convex/convex/lib/errors.ts` | Standardized error types | Phase 4 |
| `packages/convex/convex/lib/constants.ts` | Shared validation constants | Phase 5 |
| `packages/convex/convex/crons.ts` | Scheduled cleanup jobs | Phase 5 |

## Files to Delete

| File | Reason | Phase |
|------|--------|-------|
| `docker-compose.yml` | Unused — project deploys to Vercel | Phase 0 |
| `Dockerfile.dev` | Unused — local dev uses pnpm directly | Phase 0 |
