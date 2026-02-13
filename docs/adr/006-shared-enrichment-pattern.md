# ADR 006: Shared Author Enrichment Pattern

## Status

Accepted

## Context

Author enrichment — fetching a user document and their profile to produce a display-ready object with name, avatar, username, and role — was duplicated 15+ times across `forum.ts`, `products.ts`, and `users.ts`. Each instance followed the same pattern:

```ts
const user = await ctx.db.get(userId);
const profile = await ctx.db
  .query("userProfiles")
  .withIndex("by_user", (q) => q.eq("userId", userId))
  .first();
// ... manually assemble name, avatar, etc.
```

This caused:
- Inconsistent field selection (some callers included `role`, others didn't).
- No deduplication when enriching multiple authors in a list (same user fetched N times).
- Boilerplate obscuring actual handler logic.

## Decision

Extract a shared enrichment module at `packages/convex/convex/lib/shared/author.ts` providing:

### `enrichAuthor(ctx, userId): AuthorInfo | null`

Fetches the user + profile and returns a normalized `AuthorInfo` object:

```ts
interface AuthorInfo {
  id: Id<"users">;
  name: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  role?: string;
}
```

### `enrichAuthorBatch(ctx, userIds): Map<Id<"users">, AuthorInfo | null>`

Deduplicates user IDs, fetches each once via `Promise.all`, and returns a `Map` for O(1) lookup. This is used in list views where the same author may appear on multiple threads.

### Batch Dedup Strategy

We chose **application-level dedup with `Promise.all`** rather than a cache layer because:
- Convex queries already run in a transactional context with read caching at the database layer.
- The dedup window is per-request (not cross-request), which is the appropriate scope — stale author data across requests is acceptable for display purposes.
- Adding an explicit LRU or WeakMap cache would add complexity without meaningful performance benefit given Convex's execution model.

## Consequences

- **Positive**: Single source of truth for author field selection. Adding a new field (e.g., `badges`) only requires changing `AuthorInfo` and `enrichAuthor`.
- **Positive**: Batch dedup prevents redundant reads in list handlers.
- **Positive**: Consistent naming (`AuthorInfo`) across all domain modules.
- **Negative**: Slight over-fetching — `enrichAuthor` always fetches the full profile even if the caller only needs the name. This is acceptable because profile reads are indexed O(1) lookups.
