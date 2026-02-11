# Phase 06 - CI guardrails and governance

## Objective
Prevent regression to non-SOLID patterns after refactor rollout.

## SOLID focus
- Sustains all five principles through automated checks and governance.

## Tasks
- [ ] Add static analysis constraints for complexity and file size in critical backend directories.
- [ ] Add lint restrictions for duplicated auth checks and unsafe casts.
- [ ] Add architecture boundary checks for app, service, and data layers.
- [ ] Add required checks in CI:
  - lint
  - typecheck
  - targeted tests
  - architectural rules
- [ ] Add ADR documents:
  - auth policy model
  - domain service boundaries
  - shared type contracts
- [ ] Add pull request checklist section for SOLID conformance.

## Validation
- [ ] CI fails on violation of boundary and contract rules.
- [ ] Team docs reflect new coding standards.

## Exit criteria
- SOLID guardrails are enforceable and visible in daily workflow.
