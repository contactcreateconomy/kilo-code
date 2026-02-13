# ADR 004: CI Rule Severity and Exception Process

## Status
Accepted

## Context
Introducing new CI checks (complexity limits, import boundaries, format checks) risks blocking delivery if existing code has pre-existing violations. A big-bang enforcement approach would be disruptive.

## Decision
We adopt a phased rollout strategy for new CI rules:

1. **Phase 1 — Report only**: New rules added as ESLint warnings (`warn` severity). CI runs checks but does not block merges.
2. **Phase 2 — Block new violations**: After baseline violations are documented, CI blocks PRs that introduce NEW violations while allowing existing ones.
3. **Phase 3 — Full enforcement**: After a remediation window, all violations block CI including pre-existing ones.

Exception process:
- Temporary waivers use eslint-disable comments with explanation and JIRA/issue reference
- Waivers must have an expiration plan documented in the disable comment
- Generated or framework-required files that exceed thresholds are added to ESLint ignore patterns

## Consequences
- Teams can adopt new rules incrementally without blocking delivery
- Pre-existing violations are visible but not disruptive
- New code meets higher standards immediately
- Exception process prevents rule erosion while allowing pragmatic overrides
- Remediation progress is trackable through declining warning counts
