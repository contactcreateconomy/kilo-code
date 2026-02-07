# Phase 3: Performance Optimizations

## Finding P1: Full Table Scans in getDashboardStats - HIGH

**File**: [`packages/convex/convex/functions/admin.ts`](../packages/convex/convex/functions/admin.ts:65)

**Problem**: `getDashboardStats` calls `.collect()` on multiple tables to count records and compute aggregates. This reads ALL records into memory for tables like `orders`, `products`, `userProfiles`, and `sellers`. As the database grows, this becomes progressively slower and will eventually hit Convex's function time/memory limits.

**Affected operations**:
- `ctx.db.query("orders").collect()` — reads all orders
- `ctx.db.query("products").collect()` — reads all products
- `ctx.db.query("userProfiles").collect()` — reads all users
- `ctx.db.query("sellers").collect()` — reads all sellers
- Filters applied in JS after full collection

**Root Cause**: Using `.collect()` as a poor substitute for aggregation queries. Convex does not have built-in COUNT or SUM, so developers resort to pulling all records.

**Fix**: Use Convex aggregate components or maintain pre-computed counters.

### Tasks
- [ ] Install and configure `@convex-dev/aggregate` for counter-based aggregation
- [ ] Create a `stats` table with pre-computed counters updated via triggers
- [ ] Replace `.collect()` calls with counter reads
- [ ] Add index-based filtering before collection where aggregation is unavoidable
- [ ] Paginate large queries when full collection is truly needed

---

## Finding P2: N+1 Query Pattern in Product Listings - HIGH

**File**: [`packages/convex/convex/functions/products.ts`](../packages/convex/convex/functions/products.ts:89)

**Problem**: `listProducts` and similar queries fetch a list of products, then loop through each product to fetch its images, seller info, and category info. For a page of 20 products, this results in 20+ additional queries per page load.

**Pattern**:
```typescript
const products = await ctx.db.query("products")...collect();
const enriched = await Promise.all(
  products.map(async (product) => {
    const images = await ctx.db.query("productImages")...collect(); // N queries
    const seller = await ctx.db.get(product.sellerId);              // N queries
    const category = await ctx.db.get(product.categoryId);          // N queries
    return { ...product, images, seller, category };
  })
);
```

**Root Cause**: Normalized data model without join support requires manual enrichment.

**Fix**: Since Convex doesn't have joins, the N+1 pattern is somewhat unavoidable, but we can mitigate:
1. Use `Promise.all()` for parallel fetching — already done here
2. Consider denormalizing frequently-needed fields onto the product document
3. Limit the number of products fetched per page

### Tasks
- [ ] Denormalize `sellerName`, `categoryName`, and `primaryImageUrl` onto the `products` table
- [ ] Update product mutations to maintain denormalized fields
- [ ] Reduce default page size if currently unbounded
- [ ] Only fetch full enrichment for detail pages, not list pages

---

## Finding P3: incrementViewCount Uses Mutation for Every Page View - MEDIUM

**File**: [`packages/convex/convex/functions/products.ts`](../packages/convex/convex/functions/products.ts:272)

**Problem**: `incrementViewCount` is a mutation that writes to the database on every single page view. This is expensive for popular products and creates unnecessary write pressure. There is no rate limiting — the same user can inflate view counts by refreshing repeatedly.

**Root Cause**: Using real-time mutations for analytics counters.

**Fix**: 
- Rate limit view counts per user/IP
- Consider batching: collect views in a temporary buffer and flush periodically
- Use Convex scheduled functions to batch view count updates

### Tasks
- [ ] Add per-user rate limiting: one view count per user per product per hour
- [ ] Consider using an action + scheduled mutation to batch view updates
- [ ] Add anonymous user fingerprinting for view deduplication

---

## Finding P4: getTenantStats Has Same Full-Scan Problem - MEDIUM

**File**: [`packages/convex/convex/functions/admin.ts`](../packages/convex/convex/functions/admin.ts:270)

**Problem**: `getTenantStats` queries tenants, then for each tenant queries ALL orders and products with `.collect()`. This is O(T x N) where T is the number of tenants and N is the total records.

**Fix**: Same approach as P1 — use pre-computed counters per tenant.

### Tasks
- [ ] Add per-tenant counter fields in the `tenants` table
- [ ] Update order/product mutations to increment tenant counters
- [ ] Replace full-scan queries with counter reads

---

## Finding P5: cleanupExpiredSessions Collects All Expired Sessions - LOW

**File**: [`packages/convex/convex/auth.ts`](../packages/convex/convex/auth.ts:452)

**Problem**: `cleanupExpiredSessions` uses `.collect()` to load all expired sessions at once. If there are millions of expired sessions, this will exceed memory limits.

**Fix**: Process sessions in batches using cursor-based pagination.

### Tasks
- [ ] Paginate the cleanup query using `.paginate()` or `.take(100)` with iteration
- [ ] Schedule cleanup as a recurring Convex cron job
- [ ] Delete sessions in batches to avoid timeout

---

## Finding P6: formatPrice Creates New Intl.NumberFormat on Every Call - LOW

**File**: [`packages/convex/convex/lib/stripe.ts`](../packages/convex/convex/lib/stripe.ts)

**Problem**: The `formatPrice` utility creates a `new Intl.NumberFormat()` instance on every invocation. While individually cheap, in hot paths like product listings this adds up unnecessarily.

**Root Cause**: Per the `vercel-react-best-practices` skill rule `js-hoist-intl`, `Intl.*` constructors should be hoisted to module scope.

**Fix**: Hoist the formatter to module scope.

### Tasks
- [ ] Create a module-scoped `Intl.NumberFormat` instance with default currency
- [ ] Use it in `formatPrice` instead of constructing a new one each time
- [ ] If multiple currencies are needed, use a cache/Map of formatters
