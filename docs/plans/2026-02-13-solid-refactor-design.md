# SOLID Refactoring Design — Full-Stack Scope

**Date:** 2026-02-13
**Branch:** 013-SOLID-principle
**Approach:** Backend-first, then frontend. Tests as we go.

---

## Problem Statement

The monorepo has SOLID violations concentrated in three backend files (`forum.ts`, `products.ts`, `users.ts`) and one frontend hook (`useForum`). The `orders.ts` domain was already extracted into a clean `lib/orders/` module structure — we replicate that pattern across the remaining violators.

## Existing Pattern (Target Architecture)

The `packages/convex/convex/lib/orders/` module demonstrates the target:

| File | Responsibility |
|------|---------------|
| `*.types.ts` | Domain type definitions |
| `*.policies.ts` | Authorization rules and guards |
| `*.service.ts` | Business logic (validation, calculation) |
| `*.repository.ts` | Database read/write operations |
| `*.mappers.ts` | Response shaping (pure, no DB) |
| `index.ts` | Barrel re-export |

---

## Phase 1: Backend — Forum Domain Extraction

**Target:** `packages/convex/convex/functions/forum.ts` (2255 lines, worst violator)

### Violations Addressed

| Violation | Principle | Location |
|-----------|-----------|----------|
| `createThread` does 7+ things (validate, check bans, generate slug, create records, update stats) | SRP | lines 442-633 |
| `listDiscussions` mixes query building, sorting, and enrichment | SRP | lines 1263-1433 |
| All functions directly query schema tables | DIP | throughout |
| Comment tree building is inline | SRP | multiple functions |

### New Files

```
packages/convex/convex/lib/forum/
├── index.ts              # Barrel export
├── forum.types.ts        # ForumCategoryTreeNode, CommentTreeNode, CreateThreadInput, etc.
├── forum.policies.ts     # checkBanStatus/checkMuteStatus delegation, thread permission checks
├── forum.service.ts      # Slug generation, title validation, post-type validation, comment tree building, sorting algorithms
├── forum.repository.ts   # All DB reads/writes (getThread, listThreads, createThread record, etc.)
└── forum.mappers.ts      # enrichThread, enrichPost, toThreadListItem, toCategoryTree
```

### Key Extractions

1. **forum.service.ts** — `generateSlug()`, `validateThreadInput()`, `validatePostType()`, `buildCommentTree()`, `sortThreads()` (hot/top/controversial algorithms)
2. **forum.repository.ts** — `getThreadById()`, `getThreadsByCategory()`, `createThreadRecord()`, `createPostRecord()`, `updateCategoryStats()`, `getPostComments()`
3. **forum.mappers.ts** — `enrichThreadWithAuthor()`, `toCategoryTreeNode()`, `toThreadListItem()`
4. **forum.policies.ts** — Thread-level permission checks (can edit, can delete, can pin/lock)

### Result

`forum.ts` becomes a thin orchestration layer: each mutation/query calls service → repository → mapper functions.

---

## Phase 2: Backend — Products Domain Extraction

**Target:** `packages/convex/convex/functions/products.ts`

### Violations Addressed

| Violation | Principle | Location |
|-----------|-----------|----------|
| `listProducts` has 6 conditional query branches | SRP | lines 32-136 |
| Product enrichment mixed with query logic | SRP | throughout |

### New Files

```
packages/convex/convex/lib/products/
├── index.ts
├── products.types.ts
├── products.repository.ts   # Query strategies extracted as named functions
├── products.mappers.ts      # Product enrichment (images, seller, category)
└── products.service.ts      # Validation, slug generation
```

---

## Phase 3: Backend — Users Domain Extraction

**Target:** `packages/convex/convex/functions/users.ts`

### Violations Addressed

| Violation | Principle | Location |
|-----------|-----------|----------|
| `requestSellerRole` mixes rate limiting, validation, and creation | SRP | lines 392-462 |

### New Files

```
packages/convex/convex/lib/users/
├── index.ts
├── users.types.ts
├── users.repository.ts
├── users.service.ts        # Role validation, profile creation logic
└── users.policies.ts       # Role-based access checks using shared policies.ts predicates
```

---

## Phase 4: Frontend — Split `useForum` Hook

**Target:** `apps/forum/src/hooks/use-forum.ts`

### Violation Addressed

| Violation | Principle | Location |
|-----------|-----------|----------|
| `useForum()` bundles 7 mutations — component needing only `createThread` instantiates all 7 | ISP/SRP | lines 87-168 |

### Changes

Split into two focused hooks:

```typescript
// use-thread-mutations.ts — thread CRUD + view count
export function useThreadMutations(): UseThreadMutationsResult { ... }

// use-post-mutations.ts — post/comment CRUD
export function usePostMutations(): UsePostMutationsResult { ... }
```

Keep `useForum()` as a re-export facade for backward compatibility during migration:

```typescript
// use-forum.ts — facade (deprecated)
export function useForum() {
  return { ...useThreadMutations(), ...usePostMutations() };
}
```

Query hooks (`useCategories`, `useThreads`, etc.) stay as-is — they already follow SRP.

---

## Phase 5: Tests

Each new domain module gets unit tests:

```
packages/convex/convex/lib/forum/__tests__/
├── forum.service.test.ts     # Slug generation, validation, sorting, tree building
├── forum.mappers.test.ts     # Response shaping (pure functions, easy to test)
└── forum.policies.test.ts    # Permission predicates

packages/convex/convex/lib/products/__tests__/
├── products.mappers.test.ts
└── products.service.test.ts

packages/convex/convex/lib/users/__tests__/
└── users.service.test.ts
```

Focus tests on pure functions (service, mappers, policies). Repository functions that need Convex context are tested via integration tests or deferred.

---

## Out of Scope

- Refactoring other frontend hooks (already follow SRP)
- Schema changes
- Auth system changes
- Admin data-table (already refactored)
- Protected route components (already refactored)

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking existing API contracts | Functions in `forum.ts` keep same signatures; internals change |
| Import path changes | Barrel `index.ts` files keep public API stable |
| Merge conflicts with main | Keep phases small and independently mergeable |

## Success Criteria

1. `forum.ts` drops from 2255 lines to ~300 lines (orchestration only)
2. All new service/mapper functions have unit tests
3. `pnpm typecheck` passes across all apps
4. `pnpm build` succeeds
5. No behavioral changes — same API surface
