# Phase 4: Advanced Commerce & Platform

> Subscriptions, tax handling, multi-currency, 2FA, public API, and other advanced platform features.

---

## Overview

This phase covers the more complex features that make Gumroad a mature platform: recurring billing, international tax compliance, public developer API, security enhancements, and advanced platform infrastructure.

---

## Features to Implement

### 4.1 Subscription / Membership Products

**Gumroad reference:** `subscriptions_controller.rb`, `Subscription` model, recurring billing, `churn_controller.rb`

**What to build:**
- Schema: `subscriptions` table with `userId`, `productId`, `sellerId`, `stripeSubscriptionId`, `status`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`
- Product type: add `productType` field — `one_time`, `subscription`, `free`
- Subscription billing periods: monthly, quarterly, yearly
- Stripe Subscription integration via Stripe Connect
- Buyer subscription management: view, cancel, pause, upgrade
- Seller subscription analytics: MRR, churn rate, active subscribers
- Dunning: handle failed payments, retry logic

### 4.2 Subscription Management — Buyer

**Gumroad reference:** `subscriptions_controller.rb`, Churn component

**What to build:**
- New page: `apps/marketplace/src/app/account/subscriptions/page.tsx`
- List active, paused, and cancelled subscriptions
- Cancel flow with optional retention offers
- Upgrade/downgrade between tiers
- Payment method update
- Billing history per subscription

### 4.3 Tax Collection & Compliance

**Gumroad reference:** `tax_center_controller.rb`, `backtax_agreement.rb`, various tax models

**What to build:**
- Tax calculation at checkout based on buyer location
- Integration with tax calculation service — Stripe Tax or TaxJar
- Tax reporting for sellers
- Schema: add `taxAmount` field to orders and orderItems
- VAT handling for EU customers
- Tax center page in seller dashboard

### 4.4 Multi-Currency Support

**Gumroad reference:** Country-specific pricing, currency conversion

**What to build:**
- Display prices in buyer local currency
- Currency conversion at checkout
- Seller can set prices in different currencies
- Store original currency and converted currency in orders
- Use Stripe currency capabilities

### 4.5 Purchase Receipts & Invoices

**Gumroad reference:** Invoice generation with wkhtmltopdf

**What to build:**
- Auto-generate receipt on purchase completion
- PDF receipt with: order number, date, items, prices, tax, total
- Email receipt to buyer
- Downloadable from order history
- Seller-branded receipts with logo

### 4.6 Two-Factor Authentication

**Gumroad reference:** `two_factor_authentication_controller.rb`

**What to build:**
- TOTP-based 2FA — Google Authenticator, Authy compatible
- 2FA setup flow with QR code
- Recovery codes generation and storage
- 2FA challenge on login
- Schema: add 2FA fields to user model

### 4.7 Public API

**Gumroad reference:** `api/` controller directory, OAuth, API documentation

**What to build:**
- RESTful API endpoints for products, orders, licenses
- API key management for sellers
- OAuth 2.0 for third-party integrations
- Rate limiting per API key
- API documentation page
- Schema: `apiKeys` table with `userId`, `key`, `name`, `permissions`, `lastUsedAt`

### 4.8 Webhook Integrations — Outbound

**Gumroad reference:** `foreign_webhooks_controller.rb`

**What to build:**
- Seller-configurable webhook URLs
- Events: product.sold, subscription.created, subscription.cancelled, refund.created
- Webhook delivery with retry logic
- Webhook logs in seller dashboard
- Schema: `webhookEndpoints` table, `webhookDeliveries` table

### 4.9 Workflow Automations

**Gumroad reference:** `workflows/` controller directory

**What to build:**
- Trigger-action automation system
- Triggers: purchase, subscription start, subscription cancel, review received
- Actions: send email, grant access, remove access, add tag
- Seller UI: visual workflow builder
- Schema: `workflows`, `workflowSteps` tables

### 4.10 Custom Domains

**Gumroad reference:** `custom_domain/` controller, ACME challenges

**What to build:**
- Sellers can map custom domains to their storefront
- SSL certificate provisioning via Let's Encrypt
- DNS verification flow
- Custom domain routing in app
- Schema: add `customDomain`, `customDomainVerified` to sellers

---

## Schema Changes Required

```
subscriptions: defineTable({
  userId: v.id("users"),
  productId: v.id("products"),
  sellerId: v.id("users"),
  stripeSubscriptionId: v.string(),
  status: v.union(
    v.literal("active"),
    v.literal("paused"),
    v.literal("cancelled"),
    v.literal("past_due"),
    v.literal("trialing")
  ),
  pricePerPeriod: v.number(),
  billingPeriod: v.union(
    v.literal("monthly"),
    v.literal("quarterly"),
    v.literal("yearly")
  ),
  currentPeriodStart: v.number(),
  currentPeriodEnd: v.number(),
  cancelAtPeriodEnd: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

apiKeys: defineTable({
  userId: v.id("users"),
  name: v.string(),
  keyHash: v.string(),
  keyPrefix: v.string(),
  permissions: v.array(v.string()),
  lastUsedAt: v.optional(v.number()),
  expiresAt: v.optional(v.number()),
  isActive: v.boolean(),
  createdAt: v.number(),
})

webhookEndpoints: defineTable({
  sellerId: v.id("users"),
  url: v.string(),
  events: v.array(v.string()),
  secret: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

webhookDeliveries: defineTable({
  endpointId: v.id("webhookEndpoints"),
  event: v.string(),
  payload: v.string(),
  statusCode: v.optional(v.number()),
  responseBody: v.optional(v.string()),
  deliveredAt: v.optional(v.number()),
  retryCount: v.number(),
  nextRetryAt: v.optional(v.number()),
  createdAt: v.number(),
})

workflows: defineTable({
  sellerId: v.id("users"),
  name: v.string(),
  triggerEvent: v.string(),
  triggerProductId: v.optional(v.id("products")),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})

workflowSteps: defineTable({
  workflowId: v.id("workflows"),
  stepType: v.string(),
  config: v.string(),
  sortOrder: v.number(),
  delayMinutes: v.optional(v.number()),
})
```

---

## Files to Create/Modify

### Backend - `packages/convex/convex/`
- [ ] `schema.ts` — Add all tables listed above
- [ ] `functions/subscriptions.ts` — New: subscription lifecycle management
- [ ] `functions/apiKeys.ts` — New: API key CRUD
- [ ] `functions/webhookEndpoints.ts` — New: webhook config
- [ ] `functions/workflows.ts` — New: workflow engine
- [ ] `functions/stripe.ts` — Modify: add subscription handling
- [ ] `http.ts` — Modify: add public API routes
- [ ] `lib/tax.ts` — New: tax calculation helpers
- [ ] `lib/invoices.ts` — New: receipt generation
- [ ] `lib/webhookDelivery.ts` — New: outbound webhook delivery

### Marketplace App - `apps/marketplace/src/`
- [ ] `app/account/subscriptions/page.tsx` — New: manage subscriptions
- [ ] `components/account/subscription-list.tsx` — New
- [ ] `components/account/subscription-cancel.tsx` — New
- [ ] `components/checkout/tax-summary.tsx` — New
- [ ] `app/account/settings/security/page.tsx` — New: 2FA setup

### Seller App - `apps/seller/src/`
- [ ] `app/subscriptions/page.tsx` — New: subscription analytics
- [ ] `app/settings/tax/page.tsx` — New: tax configuration
- [ ] `app/settings/api/page.tsx` — New: API key management
- [ ] `app/settings/webhooks/page.tsx` — New: webhook configuration
- [ ] `app/automations/page.tsx` — New: workflow builder
- [ ] `app/settings/domain/page.tsx` — New: custom domain setup
- [ ] `components/settings/two-factor-setup.tsx` — New

### Shared - `packages/ui/src/`
- [ ] `components/invoice-template.tsx` — New: receipt template

---

## Dependencies

- Stripe Subscriptions API and Billing Portal
- Tax calculation service — Stripe Tax recommended
- TOTP library for 2FA — otplib
- PDF generation library for invoices
- SSL certificate provisioning for custom domains
- Background job system for webhook delivery retries
