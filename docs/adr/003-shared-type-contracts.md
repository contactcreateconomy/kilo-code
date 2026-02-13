# ADR 003: Shared Type Contract Strategy

## Status
Accepted

## Context
Frontend hooks across the forum app defined local, duplicated type definitions for query/mutation result envelopes. ID conversions used unsafe `as never` casts scattered across hooks. There was no standard for how hooks expose their data to components.

## Decision
We adopted a three-part contract strategy:
1. **Shared envelope types** (`@createconomy/ui/types/envelope`) — `QueryEnvelope<T>` and `MutationEnvelope<T>` generic types used by all hooks, providing consistent `{ data, isLoading, error }` shapes
2. **Centralized ID helpers** (`forum-id-helpers.ts`) — Type-safe ID conversion functions and query argument builders that isolate all `as Id<"...">` casts to a single file
3. **Explicit return types** — All hooks declare named result types (e.g., `UseCategoriesResult`, `UseThreadResult`) with explicit function return type annotations

## Consequences
- Zero duplicated envelope type definitions across hooks
- Zero unsafe casts (`any`, `as never`) in hook files
- ID casts isolated to a single, auditable helper file
- Components receive strongly typed data from hooks
- New hooks follow the established envelope + helper pattern
- Contract changes are detectable at compile time
