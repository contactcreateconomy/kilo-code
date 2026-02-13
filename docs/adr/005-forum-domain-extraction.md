# ADR 005: Forum Domain Extraction

## Status

Accepted

## Context

The `packages/convex/convex/functions/forum.ts` file had grown to 2,256 lines containing 32 exported functions with 8 mixed responsibilities:

1. Category CRUD
2. Thread CRUD + lifecycle (pin, lock, delete)
3. Post CRUD
4. Comment CRUD
5. Reaction/voting system
6. Author enrichment (duplicated 15+ times inline)
7. Feed sorting and pagination
8. Leaderboard and community stats

This monolithic structure violated Single Responsibility (S), Open/Closed (O) — new forum features required editing 2,000+ lines — and made the file difficult to review, test, and reason about.

## Decision

Extract the forum domain into `packages/convex/convex/lib/forum/` following the same layered architecture established by the orders domain extraction (ADR 002):

| Module | Responsibility |
|--------|---------------|
| `forum.types.ts` | Domain type definitions (`EnrichedThread`, `CommentTreeNode`, `ForumCategoryTreeNode`, etc.) |
| `forum.repository.ts` | All database access (reads and writes) via typed context parameters |
| `forum.policies.ts` | Authorization predicates (`canEditThread`, `canDeletePost`, etc.) composing shared helpers |
| `forum.service.ts` | Pure business logic (slug generation, input validation, sorting, scoring) |
| `forum.mappers.ts` | Response shaping (`toThreadListItem`, `toCommentTree`, `toCategoryTree`, etc.) |
| `index.ts` | Barrel export |

The `forum.ts` function file was rewritten to delegate to these modules. All exported function names remain identical — the Convex API surface is unchanged.

## Responsibility Grouping

We chose to group by **architectural layer** (repository, service, policies, mappers) rather than by **feature** (threads/, posts/, comments/) because:

- The forum domain's features are heavily interconnected (creating a post updates thread and category counts).
- The orders domain already established this pattern, and consistency across domains reduces cognitive overhead.
- Layer-based grouping makes authorization audits straightforward — all access checks live in one file.

## Consequences

- **Positive**: `forum.ts` reduced from ~2,256 lines to ~1,340 lines. Each handler is a thin orchestration layer.
- **Positive**: Author enrichment duplication eliminated — now uses `enrichAuthor` from `lib/shared/author.ts`.
- **Positive**: Sorting/scoring logic is independently testable in `forum.service.ts`.
- **Negative**: More files to navigate. Mitigated by the barrel export and IDE "go to definition".
- **Negative**: Repository functions use `as never` casts for insert calls because Convex's type system for table inserts is highly specific. This is a known Convex pattern.
