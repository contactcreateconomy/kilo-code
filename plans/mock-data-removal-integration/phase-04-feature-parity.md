# Phase 04: Feature Parity — Close Remaining Gaps in Admin & Seller Apps

## Goal
Ensure admin and seller apps have full feature parity with what the backend supports and what forum/marketplace already implement. No half-built UI — every page should be functionally complete.

---

## Feature Comparison Matrix

### Forum App Features (Reference — Fully Integrated)

| Feature | Backend Function | UI Status |
|---------|-----------------|-----------|
| Thread CRUD | `forum.*` | ✅ Full |
| Comments with nesting | `comments.*` | ✅ Full |
| Reactions | `social.*` / reactions | ✅ Full |
| Tags | `tags.*` | ✅ Full |
| Categories | `categories.*` (forum) | ✅ Full |
| User profiles | `users.*` | ✅ Full |
| Follow/unfollow | `social.*` | ✅ Full |
| Notifications | `notifications.*` | ✅ Full |
| Polls | `polls.*` | ✅ Full |
| Flairs | `flairs.*` | ✅ Full |
| Leaderboard | via `userPoints` | ✅ Full |
| Community stats | `social.*` | ✅ Full |
| Moderation reports | `moderation.*` | ✅ Full |
| Search | forum search | ✅ Full |
| Rich text editor | TipTap | ✅ Full |
| Image gallery posts | post types | ✅ Full |
| Link previews | embed detection | ✅ Full |

### Marketplace App Features (Reference — Fully Integrated)

| Feature | Backend Function | UI Status |
|---------|-----------------|-----------|
| Product browsing | `products.*` | ✅ Full |
| Product search/filter | `products.*` | ✅ Full |
| Cart | `cart.*` | ✅ Full |
| Checkout | `stripe.*` + `orders.*` | ✅ Full |
| Orders | `orders.*` | ✅ Full |
| Reviews | `reviews.*` | ✅ Full |
| Wishlists | `wishlists.*` | ✅ Full |
| User account | `users.*` | ✅ Full |
| Categories | `categories.*` | ✅ Full |
| Seller profiles | `products.*` by seller | ✅ Full |
| Downloads/Library | `licenses.*` | ✅ Full |
| Subscriptions | `subscriptions.*` | ✅ Full |
| Discount codes | `offerCodes.*` at checkout | ✅ Full |

### Admin App — Feature Gap Analysis

| Feature | Backend Function | UI Page Exists | Integrated | Gap |
|---------|-----------------|---------------|------------|-----|
| Dashboard stats | `admin.getDashboardStats` | ✅ | ❌ Mock | Wire up |
| User management | `admin.listAllUsers`, `changeUserRole`, `updateUserStatus` | ✅ | ❌ Mock | Wire up |
| Order management | `admin.listAllOrders`, `forceUpdateOrderStatus` | ✅ | ❌ Mock | Wire up |
| Product management | `admin.listPendingReviews` + `products.*` | ✅ | ❌ Mock | Wire up |
| Seller management | `admin.listPendingSellers`, `approveSeller` | ✅ | ❌ Mock | Wire up |
| Category management | `categories.*` | ✅ | ❌ Mock | Wire up |
| Analytics | `admin.getDashboardStats` | ✅ | ❌ Mock | Wire up |
| Moderation dashboard | `moderation.*` | ✅ | ✅ Real | None |
| Moderation reports | `moderation.listReports` | ✅ | ✅ Real | None |
| Moderation bans | `moderation.listBans` | ✅ | ✅ Real | None |
| System health | `admin.getSystemHealth` | ❌ No page | N/A | **Missing page** |
| Stripe disputes | `stripeDisputes` table | ❌ No page | N/A | **Missing page** |
| Webhook events | `stripeWebhookEvents` table | ❌ No page | N/A | **Missing page** |
| Rate limit monitor | `rateLimitRecords` table | ❌ No page | N/A | **Missing page** |

### Seller App — Feature Gap Analysis

| Feature | Backend Function | UI Page Exists | Integrated | Gap |
|---------|-----------------|---------------|------------|-----|
| Dashboard stats | needs seller stats query | ✅ | ❌ Mock | Wire up + backend |
| Product CRUD | `products.*` | ✅ | ❌ Mock | Wire up |
| Order management | `orders.*` | ✅ | ❌ Mock | Wire up |
| Reviews | `reviews.*` | ✅ | ❌ Mock | Wire up |
| Analytics | needs seller analytics | ✅ | ❌ Mock | Wire up + backend |
| Affiliates | `affiliates.*` | ✅ | ✅ Real | None |
| Discount codes | `offerCodes.*` | ✅ | ✅ Real | None |
| Seller posts | `sellerPosts.*` | ✅ | ✅ Real | None |
| Webhooks | `webhookEndpoints.*` | ✅ | ✅ Real | None |
| Payouts/Stripe | Stripe API | ✅ | ✅ Real | None |
| Product variants | `variants.*` | ❌ No page | N/A | **Missing page** |
| Product licenses | `licenses.*` | ❌ No page | N/A | **Missing page** |
| Subscriptions mgmt | `subscriptions.*` | ❌ No page | N/A | **Missing page** |
| Customer list | needs query | ❌ No page | N/A | **Missing page** |
| Shipping labels | shipping form exists but mock | ⚠️ | ❌ Mock | Wire up |

---

## Tasks: Admin Missing Pages

### Task 1: Add System Health Page

**New file:** `apps/admin/src/app/system/page.tsx`

**Purpose:** Display system health metrics using `api.functions.admin.getSystemHealth`

**Features:**
- Active session count
- Orders in last hour
- Webhook error count
- System status indicator (healthy/degraded/down)
- Auto-refresh every 30 seconds

---

### Task 2: Add Stripe Events Page

**New file:** `apps/admin/src/app/stripe/events/page.tsx`

**Purpose:** View Stripe webhook events for debugging

**Features:**
- List recent webhook events from `stripeWebhookEvents` table
- Show event type, status (processed/failed), timestamp
- Show error messages for failed events
- Filter by event type
- May need new backend query: `admin.listStripeWebhookEvents`

---

### Task 3: Add Stripe Disputes Page

**New file:** `apps/admin/src/app/stripe/disputes/page.tsx`

**Purpose:** View and manage Stripe disputes

**Features:**
- List disputes from `stripeDisputes` table
- Show status, amount, reason, evidence deadline
- Link to associated order
- May need new backend query: `admin.listStripeDisputes`

---

## Tasks: Seller Missing Pages

### Task 4: Add Product Variants Management

**New file:** `apps/seller/src/app/products/[id]/variants/page.tsx`

**Purpose:** Manage product variants (sizes, colors, tiers)

**Backend:** `api.functions.variants.*` already exists

**Features:**
- List variants for a product
- Create/edit/delete variants
- Set variant-specific pricing
- SKU management

---

### Task 5: Add License Key Management

**New file:** `apps/seller/src/app/products/[id]/licenses/page.tsx`

**Purpose:** Manage license keys for digital products

**Backend:** `api.functions.licenses.*` already exists

**Features:**
- View issued licenses
- Generate new license keys
- Activate/deactivate licenses
- View license usage stats

---

### Task 6: Add Subscription Management Page

**New file:** `apps/seller/src/app/subscriptions/page.tsx`

**Purpose:** View and manage subscription-based products

**Backend:** `api.functions.subscriptions.*` already exists

**Features:**
- List active subscriptions
- View subscriber details
- Cancel/pause subscriptions
- Revenue from subscriptions

---

### Task 7: Add Customer List Page

**New file:** `apps/seller/src/app/customers/page.tsx`

**Purpose:** View customers who have purchased from this seller

**Backend:** Needs new query to get unique buyers from seller's orders

**Features:**
- List customers with purchase history
- Total spent per customer
- Last order date
- Link to customer's orders

---

## Tasks: Shared Improvements

### Task 8: Add Sidebar Links for New Pages

**Admin sidebar** ([`apps/admin/src/components/layout/app-sidebar.tsx`](../../apps/admin/src/components/layout/app-sidebar.tsx)):
- Add "System Health" under a "System" section
- Add "Stripe Events" and "Disputes" under a "Payments" section

**Seller sidebar** ([`apps/seller/src/components/layout/app-sidebar.tsx`](../../apps/seller/src/components/layout/app-sidebar.tsx)):
- Add "Customers" link
- Add "Subscriptions" link
- Ensure "Variants" and "Licenses" are accessible from product detail pages

---

### Task 9: Ensure Empty States Are Consistent

All pages across admin and seller should show consistent empty states:
- Icon + heading + description
- Call-to-action button where applicable
- Use the same empty state pattern as forum/marketplace

---

### Task 10: Ensure Error Boundaries Are Present

Both admin and seller apps should have:
- App-level error boundary (`error.tsx`) — already exists
- Per-page error handling in queries (loading/error states)
- Toast notifications for mutation failures

---

## Validation Checklist
- [ ] Admin sidebar links match all available pages
- [ ] Seller sidebar links match all available pages
- [ ] Every existing backend function that's relevant has a corresponding UI
- [ ] No page shows mock data
- [ ] All new pages follow the app's existing layout/styling patterns
- [ ] Empty states are consistent across apps
- [ ] `pnpm typecheck` passes for all apps
- [ ] `pnpm lint` passes for all apps
- [ ] `pnpm build` succeeds for all apps
