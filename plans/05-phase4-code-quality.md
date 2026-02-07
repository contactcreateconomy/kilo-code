# Phase 4: Code Quality and TypeScript Improvements

## Finding CQ1: Extensive any Type Usage in Admin Functions - HIGH

**File**: [`packages/convex/convex/functions/admin.ts`](../packages/convex/convex/functions/admin.ts:23)

**Problem**: The `admin.ts` file uses `any` type extensively, violating the project's strict TypeScript standard from AGENTS.md which states: "Use strict TypeScript with no any types."

**Occurrences**:
- Line 23: `async function requireAdmin(ctx: any)` — the context parameter
- Multiple `.filter((q: any) => ...)` callbacks throughout
- Multiple `.map((p: any) => ...)` callbacks throughout
- `Record<string, any>` in update objects

**Root Cause**: Difficulty typing Convex's query builder and context objects without importing proper types.

**Fix**: Import proper Convex types for `QueryCtx`, `MutationCtx`, and use generic type parameters for filter/map callbacks.

**Refactored Example**:
```typescript
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  // ...
}

// For filter callbacks
.filter((q) => q.eq(q.field("isDeleted"), false))

// For map callbacks
products.map((p: Doc<"products">) => ({ ... }))
```

### Tasks
- [ ] Import `QueryCtx`, `MutationCtx`, `ActionCtx` from `_generated/server`
- [ ] Import `Doc`, `Id` from `_generated/dataModel`
- [ ] Type `requireAdmin` parameter as `QueryCtx | MutationCtx`
- [ ] Replace all `(q: any)` filter callbacks with proper Convex filter types
- [ ] Replace all `(p: any)` map callbacks with `Doc<"tableName">` types
- [ ] Remove all `Record<string, any>` with specific update types

---

## Finding CQ2: Record of string to any in Order Functions - MEDIUM

**File**: [`packages/convex/convex/functions/orders.ts`](../packages/convex/convex/functions/orders.ts:538)

**Problem**: `updateOrderStatus` and `forceUpdateOrderStatus` use `Record<string, any>` for the update object, bypassing type safety.

**Current Code**:
```typescript
const updateData: Record<string, any> = {
  status: args.status,
  updatedAt: Date.now(),
};
```

**Fix**: Define proper update interfaces.

### Tasks
- [ ] Create typed update interfaces for order status changes
- [ ] Replace `Record<string, any>` with specific types
- [ ] Ensure all fields in the update match the schema

---

## Finding CQ3: Duplicated Code Between validation.ts and security.ts - MEDIUM

**Files**:
- [`packages/convex/convex/helpers/validation.ts`](../packages/convex/convex/helpers/validation.ts)
- [`packages/convex/convex/lib/security.ts`](../packages/convex/convex/lib/security.ts)

**Problem**: Both files implement:
- Rate limiting types and functions
- Input sanitization
- SQL/NoSQL injection detection patterns
- XSS detection

This violates DRY and creates a maintenance burden — fixing a bug in one requires remembering to fix the other.

**Fix**: Consolidate into a single `lib/security.ts` module and re-export from `helpers/validation.ts` for backward compatibility.

### Tasks
- [ ] Compare the two implementations to identify the more complete one
- [ ] Consolidate into `lib/security.ts` as the single source of truth
- [ ] Update `helpers/validation.ts` to re-export from `lib/security.ts`
- [ ] Update all imports across the codebase

---

## Finding CQ4: tenantFilter Returns True Instead of Convex Filter - MEDIUM

**File**: [`packages/convex/convex/helpers/multitenancy.ts`](../packages/convex/convex/helpers/multitenancy.ts)

**Problem**: The `tenantFilter` function is supposed to return a Convex-compatible filter expression, but actually returns `true` as a boolean. This means tenant isolation is NOT enforced — all queries see all tenants' data.

**Current Code** (likely):
```typescript
export function tenantFilter(q: any, tenantId?: string) {
  if (!tenantId) return true;
  return q.eq(q.field("tenantId"), tenantId);
}
```

**Fix**: This needs to be integrated properly into Convex's `.filter()` chain.

### Tasks
- [ ] Fix `tenantFilter` to return a proper Convex filter expression
- [ ] Remove `any` type from the `q` parameter
- [ ] Add unit tests for tenant isolation
- [ ] Audit all queries using `tenantFilter` to ensure correct usage

---

## Finding CQ5: Unused Imports Across Multiple Files - LOW

**Problem**: Several files import types like `Id` from `_generated/dataModel` but never use them. This creates noise and can confuse developers.

**Fix**: Run a lint pass to identify and remove unused imports.

### Tasks
- [ ] Configure ESLint `no-unused-imports` rule
- [ ] Run `pnpm lint --fix` across the monorepo
- [ ] Remove any remaining unused imports manually

---

## Finding CQ6: Inconsistent Error Handling Patterns - MEDIUM

**Problem**: Error handling is inconsistent across the codebase:
- Some functions throw plain `Error` objects
- Some throw `ConvexError` with structured data
- Some silently return `null` on errors
- Some log errors but don't throw

**Examples**:
- `products.ts`: Uses `ConvexError` consistently
- `admin.ts`: Mixes `ConvexError` with plain `Error`
- `orders.ts`: Throws `ConvexError` for validation but plain `Error` for system errors
- `auth.ts`: Returns `null` for invalid sessions instead of throwing

**Fix**: Standardize on `ConvexError` for all user-facing errors, plain `Error` for system-level failures, and document when `null` returns are acceptable.

### Tasks
- [ ] Create error constants or an error factory for common error types
- [ ] Replace all plain `Error` throws in Convex functions with `ConvexError`
- [ ] Document the error handling strategy in a shared `lib/errors.ts`
- [ ] Ensure all client components handle both error types appropriately

---

## Finding CQ7: Missing Return Type Annotations on Exported Functions - LOW

**Problem**: Per AGENTS.md: "Use explicit return types for exported functions." Many exported Convex functions lack explicit return type annotations, relying on TypeScript inference.

**Fix**: Add explicit return types.

### Tasks
- [ ] Add return type annotations to all exported queries
- [ ] Add return type annotations to all exported mutations
- [ ] Add return type annotations to all exported actions
- [ ] Configure ESLint `explicit-function-return-type` rule for exported functions
