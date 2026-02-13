# ADR 002: Domain Service Boundary Conventions

## Status
Accepted

## Context
The orders handler file (`functions/orders.ts`) mixed orchestration, business rules, database queries, and response mapping in each function. This made it difficult to test business rules independently, reuse query patterns, or modify response shapes without risk of breaking business logic.

## Decision
We extracted domain logic into a layered module structure under `lib/orders/`:
- **types** (`orders.types.ts`) — Domain types, DTOs, status enums
- **policies** (`orders.policies.ts`) — Status transition maps, access control predicates, guard functions
- **service** (`orders.service.ts`) — Pure business rules (validation, calculation, state transitions)
- **repository** (`orders.repository.ts`) — Database query and mutation patterns (accept `ctx`, return typed results)
- **mappers** (`orders.mappers.ts`) — Response enrichment and API shape construction
- **barrel** (`index.ts`) — Public API export

Handler functions follow the pattern: middleware → service → repository → mapper.

## Consequences
- Business rules are independently testable (service functions are mostly pure)
- Query patterns are reusable across handlers (repository)
- Response shapes have a single source of truth (mappers)
- Handler files are significantly shorter (~35% reduction)
- New features follow the established module pattern
- Repository functions must accept Convex `ctx` to work within the transactional model
