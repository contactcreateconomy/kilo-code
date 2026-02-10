# Phase 2: Seller Tools & Revenue Features

> Features that help sellers grow revenue: pricing flexibility, discounts, affiliates, audience management, and analytics.

---

## Overview

Gumroad provides a rich set of seller tools that go far beyond basic product management. These features directly impact seller revenue and retention on the platform. Our seller app has basic CRUD and order management but lacks the revenue-multiplying tools that make Gumroad sticky for creators.

---

## Features to Implement

### 2.1 Product Variants & Tiers

**Gumroad reference:** `BaseVariant` model, variant pricing, `base_variant_integration.rb`

**What to build:**
- Schema: `productVariants` table with `productId`, `name`, `description`, `price`, `maxQuantity`, `sortOrder`
- Seller UI to create multiple pricing tiers per product
- Variant selection on product detail page
- Variant-aware cart and checkout flow
- Per-variant inventory/quantity limits

### 2.2 Pay-What-You-Want Pricing

**Gumroad reference:** Flexible pricing in checkout components

**What to build:**
- Add `pricingType` field to products: `fixed`, `pay_what_you_want`, `free`
- Add `minPrice` and `suggestedPrice` fields
- Buyer-facing price input on product detail and checkout
- Validation: price >= minPrice
- Analytics: track average price paid vs suggested

### 2.3 Offer Codes / Discount Codes

**Gumroad reference:** `offer_codes_controller.rb`, `OfferCode` model

**What to build:**
- Schema: `offerCodes` table with `sellerId`, `code`, `discountType` — percent or fixed, `discountValue`, `maxUses`, `currentUses`, `expiresAt`, `productId` — optional, per-product or store-wide
- Seller UI: create, edit, deactivate offer codes
- Checkout: discount code input field
- Validation and application logic in cart/checkout
- Display savings in order summary

### 2.4 Affiliate Program

**Gumroad reference:** `affiliates_controller.rb`, `affiliate.rb`, `affiliate_credit.rb`, `affiliate_request.rb`

**What to build:**
- Schema: `affiliates` table with `sellerId`, `affiliateUserId`, `productId`, `commissionPercent`, `status`
- Schema: `affiliateCredits` table tracking earned commissions
- Affiliate request flow: users can request to become affiliates
- Seller UI: manage affiliates, set commission rates, approve requests
- Unique affiliate links with tracking
- Commission calculation on purchases
- Affiliate dashboard showing earnings

### 2.5 Audience & Email Management

**Gumroad reference:** `audience_controller.rb`, `audience_member.rb`, `emails_controller.rb`

**What to build:**
- Schema: `audienceMembers` table — followers, customers, subscribers
- Schema: `emailBroadcasts` table for seller email campaigns
- Seller UI: audience list with filtering — by product purchased, date, etc.
- Email broadcast composer — rich text, scheduling
- Integration with email service like Resend or SendGrid
- Subscriber opt-in at checkout
- Unsubscribe management

### 2.6 Enhanced Seller Analytics

**Gumroad reference:** `analytics_controller.rb`, `Analytics` component directory, `consumption_analytics_controller.rb`

**What to build:**
- Revenue over time charts — daily, weekly, monthly
- Views-to-sales conversion funnel
- Top products by revenue and units
- Geographic breakdown of customers
- Referral source tracking
- Product-level analytics drill-down
- Enhance existing `apps/seller/src/app/analytics/` pages

### 2.7 UTM Link Tracking

**Gumroad reference:** `utm_links_controller.rb`, `utm_link_tracking_controller.rb`

**What to build:**
- Schema: `utmLinks` table with `sellerId`, `productId`, `utmSource`, `utmMedium`, `utmCampaign`, `clickCount`, `purchaseCount`
- Seller UI: create tracked links
- Click tracking middleware
- Conversion attribution
- Dashboard showing UTM performance

### 2.8 Product Duplication

**Gumroad reference:** `product_duplicates_controller.rb`

**What to build:**
- Backend function: `duplicateProduct` — copies product data, variants, files, settings
- Seller UI: duplicate button on product list and detail pages
- Handle file references — link to same files or deep copy

### 2.9 Upsells & Recommended Products

**Gumroad reference:** `recommended_products_controller.rb`

**What to build:**
- Schema: `productRecommendations` table or field on products
- Seller UI: configure related/recommended products
- Show recommendations on product detail page
- Post-purchase upsell on checkout success page

---

## Schema Changes Required

```
productVariants: defineTable({
  productId: v.id("products"),
  name: v.string(),
  description: v.optional(v.string()),
  price: v.number(),
  maxQuantity: v.optional(v.number()),
  sortOrder: v.number(),
  isDeleted: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

offerCodes: defineTable({
  sellerId: v.id("users"),
  code: v.string(),
  discountType: v.union(v.literal("percent"), v.literal("fixed")),
  discountValue: v.number(),
  productId: v.optional(v.id("products")),
  maxUses: v.optional(v.number()),
  currentUses: v.number(),
  expiresAt: v.optional(v.number()),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

affiliates: defineTable({
  sellerId: v.id("users"),
  affiliateUserId: v.id("users"),
  productId: v.optional(v.id("products")),
  commissionPercent: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  totalEarned: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

affiliateClicks: defineTable({
  affiliateId: v.id("affiliates"),
  referrerUrl: v.optional(v.string()),
  clickedAt: v.number(),
})

affiliateCredits: defineTable({
  affiliateId: v.id("affiliates"),
  orderId: v.id("orders"),
  amount: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("cancelled")
  ),
  createdAt: v.number(),
})

utmLinks: defineTable({
  sellerId: v.id("users"),
  productId: v.optional(v.id("products")),
  utmSource: v.string(),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  shortCode: v.string(),
  clickCount: v.number(),
  purchaseCount: v.number(),
  createdAt: v.number(),
})
```

---

## Files to Create/Modify

### Backend - `packages/convex/convex/`
- [ ] `schema.ts` — Add tables listed above
- [ ] `functions/variants.ts` — New: CRUD for product variants
- [ ] `functions/offerCodes.ts` — New: create, validate, apply discount codes
- [ ] `functions/affiliates.ts` — New: affiliate management, tracking, payouts
- [ ] `functions/analytics.ts` — New or enhance: detailed analytics queries
- [ ] `functions/utmLinks.ts` — New: UTM link management and tracking
- [ ] `functions/products.ts` — Modify: add duplication, recommendations
- [ ] `functions/cart.ts` — Modify: support variants, discount codes

### Seller App - `apps/seller/src/`
- [ ] `app/products/[id]/variants/page.tsx` — New: variant management
- [ ] `app/products/[id]/pricing/page.tsx` — New: pricing settings - PWYW
- [ ] `app/discounts/page.tsx` — New: offer code management
- [ ] `app/discounts/new/page.tsx` — New: create offer code
- [ ] `app/affiliates/page.tsx` — New: affiliate management
- [ ] `app/audience/page.tsx` — New: audience list
- [ ] `app/emails/page.tsx` — New: email broadcasts
- [ ] `app/analytics/page.tsx` — Enhance: rich analytics
- [ ] `app/utm/page.tsx` — New: UTM link management
- [ ] `components/products/variant-editor.tsx` — New
- [ ] `components/analytics/revenue-chart.tsx` — New
- [ ] `components/analytics/conversion-funnel.tsx` — New

### Marketplace App - `apps/marketplace/src/`
- [ ] `components/products/variant-selector.tsx` — New: variant picker
- [ ] `components/products/pwyw-input.tsx` — New: flexible price input
- [ ] `components/checkout/discount-code-input.tsx` — New
- [ ] `components/products/recommended-products.tsx` — New

---

## Dependencies

- Email service integration — Resend or SendGrid — for audience emails
- Chart library for analytics — recharts or chart.js
- Short URL generation for UTM links
