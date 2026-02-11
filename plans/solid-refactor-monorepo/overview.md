# SOLID Refactor Plan - Monorepo

## Goal
Refactor the Createconomy monorepo toward SOLID principles with small, safe, reviewable increments.

## Scope
- Backend: `packages/convex/convex/functions/*`, `packages/convex/convex/lib/*`
- Shared UI: `packages/ui/src/components/*`, `packages/ui/src/hooks/*`
- App layers: `apps/admin/src/*`, `apps/forum/src/*`, `apps/marketplace/src/*`, `apps/seller/src/*`

## SOLID mapping
- **S** Single Responsibility Principle
- **O** Open Closed Principle
- **L** Liskov Substitution Principle
- **I** Interface Segregation Principle
- **D** Dependency Inversion Principle

## Phase index
1. [Phase 01 - Baseline and inventory](./phase-01-baseline-and-inventory.md)
2. [Phase 02 - Convex auth and authorization consolidation](./phase-02-convex-authz-consolidation.md)
3. [Phase 03 - Orders domain service extraction](./phase-03-orders-domain-extraction.md)
4. [Phase 04 - Frontend typing and contract hardening](./phase-04-frontend-typing-and-contracts.md)
5. [Phase 05 - UI component decomposition](./phase-05-ui-component-decomposition.md)
6. [Phase 06 - CI guardrails and governance](./phase-06-ci-guardrails-and-governance.md)

## Execution strategy
- Do changes in vertical slices.
- Keep behavior stable with regression tests before major movement.
- Prefer wrapper migration first, then service extraction, then interface cleanup.
- Merge phase by phase.

## Success criteria
- Authorization checks are centralized and policy driven.
- Critical Convex files are reduced in size and complexity.
- Hook and component APIs are strongly typed.
- Shared UI route guarding and table behavior are decomposed by concern.
- CI prevents drift back to monolithic and duplicated patterns.
