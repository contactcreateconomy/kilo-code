# Phase 01 — Deploy Convex Functions

## Objective

Push the current Convex function source code to the development deployment so all forum query/mutation functions exist on the server.

## Context

The file [`packages/convex/convex/functions/forum.ts`](../../packages/convex/convex/functions/forum.ts) contains 11 functions added after the last deploy. The Convex runtime throws `Could not find public function` errors for each one, which crashes the frontend.

## Steps

### Step 1: Run `npx convex dev` from the Convex package directory

```bash
cd packages/convex && npx convex dev
```

This will:
- Compile all `.ts` files in `convex/`
- Push the schema and all functions to the dev deployment
- Keep watching for changes (can be Ctrl+C'd after successful push)

**Expected output**: Convex should report that new functions were pushed. Watch for any schema validation errors or type errors.

### Step 2: Verify functions are deployed

After the push completes, confirm these functions now exist on the deployment:

- `functions/forum.js:listDiscussions`
- `functions/forum.js:getLeaderboard`
- `functions/forum.js:getCommunityStats`
- `functions/forum.js:getTrendingTopics`
- `functions/forum.js:getActiveCampaign`
- `functions/forum.js:toggleReaction`
- `functions/forum.js:getUserReactions`
- `functions/forum.js:getUserProfile`
- `functions/forum.js:getCategoryBySlug`
- `functions/forum.js:listThreadsBySlug`
- `functions/forum.js:getUserThreads`

Use the Convex dashboard or `mcp--convex--functionSpec` tool to check.

### Step 3: Verify no schema issues

The [`listDiscussions`](../../packages/convex/convex/functions/forum.ts:981) function reads `thread.upvoteCount` and `thread.aiSummary` from `forumThreads`. These fields are defined as optional in the schema:

```typescript
// schema.ts line 491-498
aiSummary: v.optional(v.string()),
imageUrl: v.optional(v.string()),
upvoteCount: v.optional(v.number()),
bookmarkCount: v.optional(v.number()),
```

The function handles these with `?? 0` / `?? null` fallbacks, so no schema migration is needed.

### Step 4: Check for `forumCampaigns` table existence

The [`getActiveCampaign`](../../packages/convex/convex/functions/forum.ts:1260) function queries the `forumCampaigns` table. This table is defined in the schema but may have no documents. The function handles this correctly — it returns `null` when no active campaign is found.

## Risks

- If the Convex deployment has drifted significantly from the schema, `npx convex dev` may fail with validation errors. In that case, review the error output and fix schema conflicts before retrying.
- The `forumCampaigns` table references `by_active` index — ensure the schema push creates it.

## Done Criteria

All 11 new forum functions appear in the deployed function spec, and calling `listDiscussions` from the dashboard returns `{ discussions: [], hasMore: false }` rather than throwing.
