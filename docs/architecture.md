# Architecture Overview

> Comprehensive technical architecture documentation for the Createconomy platform.

---

## Table of Contents

- [System Overview](#system-overview)
- [Application Architecture](#application-architecture)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [Payment Flow](#payment-flow)
- [Multi-Tenancy Design](#multi-tenancy-design)
- [Security Architecture](#security-architecture)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │  Browser │  │  Mobile  │  │   PWA    │  │   API    │                     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                     │
└───────┼─────────────┼─────────────┼─────────────┼───────────────────────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────────────┐
│                     VERCEL EDGE NETWORK                                      │
│  ┌─────────────────────────┴─────────────────────────┐                      │
│  │                   Edge Functions                   │                      │
│  │              (Middleware, Auth, Routing)           │                      │
│  └─────────────────────────┬─────────────────────────┘                      │
│                             │                                                │
│  ┌──────────────┬───────────┼───────────┬──────────────┐                    │
│  │              │           │           │              │                    │
│  ▼              ▼           ▼           ▼              │                    │
│ ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │                    │
│ │Market- │  │ Forum  │  │ Admin  │  │ Seller │        │                    │
│ │ place  │  │  App   │  │  App   │  │  App   │        │                    │
│ │:3000   │  │:3001   │  │:3002   │  │:3003   │        │                    │
│ └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘        │                    │
│     │           │           │           │              │                    │
└─────┼───────────┼───────────┼───────────┼──────────────┘                    │
      │           │           │           │                                    
      └───────────┴─────┬─────┴───────────┘                                    
                        │                                                      
┌───────────────────────┼─────────────────────────────────────────────────────┐
│                 CONVEX CLOUD                                                 │
│  ┌────────────────────┴────────────────────┐                                │
│  │           Convex Functions              │                                │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │                                │
│  │  │ Queries │ │Mutations│ │ Actions │   │                                │
│  │  └────┬────┘ └────┬────┘ └────┬────┘   │                                │
│  └───────┼───────────┼───────────┼────────┘                                │
│          │           │           │                                          │
│  ┌───────┴───────────┴───────────┴────────┐                                │
│  │              Convex Database            │                                │
│  │  ┌─────────────────────────────────┐   │                                │
│  │  │  Real-time Subscriptions        │   │                                │
│  │  │  ACID Transactions              │   │                                │
│  │  │  Automatic Indexing             │   │                                │
│  │  └─────────────────────────────────┘   │                                │
│  └────────────────────────────────────────┘                                │
│                                                                             │
│  ┌────────────────┐  ┌────────────────┐                                    │
│  │  Convex Auth   │  │  File Storage  │                                    │
│  └────────────────┘  └────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                                              │
│  ┌────────────────────┴────────────────────┐                                │
│  │                                          │                                │
│  │  ┌──────────┐  ┌──────────┐  ┌────────┐ │                                │
│  │  │  Stripe  │  │  OAuth   │  │ Email  │ │                                │
│  │  │ Payments │  │Providers │  │Service │ │                                │
│  │  └──────────┘  └──────────┘  └────────┘ │                                │
│  └──────────────────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15 | Server-side rendering, routing |
| **UI** | React 19, Tailwind CSS 4 | Component library, styling |
| **Backend** | Convex | Database, serverless functions |
| **Auth** | Convex Auth | Authentication, session management |
| **Payments** | Stripe | Payment processing, Connect |
| **Deployment** | Vercel | Hosting, edge functions |
| **Build** | Turborepo | Monorepo management |

---

## Application Architecture

### Marketplace Application

```
apps/marketplace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (shop)/             # Shopping routes
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Product listings
│   │   │   ├── categories/     # Category pages
│   │   │   └── search/         # Search results
│   │   ├── (checkout)/         # Checkout flow
│   │   │   ├── cart/           # Shopping cart
│   │   │   └── checkout/       # Payment page
│   │   ├── (account)/          # User account
│   │   │   ├── orders/         # Order history
│   │   │   ├── downloads/      # Digital downloads
│   │   │   └── settings/       # Account settings
│   │   └── api/                # API routes
│   │       ├── auth/           # Auth endpoints
│   │       └── webhooks/       # Webhook handlers
│   ├── components/             # App-specific components
│   ├── hooks/                  # Custom hooks
│   └── lib/                    # Utilities
├── public/                     # Static assets
└── next.config.ts              # Next.js configuration
```

### Forum Application

```
apps/forum/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Forum homepage
│   │   ├── c/[slug]/           # Category pages
│   │   ├── t/[id]/             # Thread pages
│   │   ├── t/new/              # Create thread
│   │   ├── u/[username]/       # User profiles
│   │   └── search/             # Search
│   ├── components/
│   │   └── forum/              # Forum-specific components
│   └── hooks/
│       └── use-forum.ts        # Forum hooks
```

### Admin Application

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── users/              # User management
│   │   ├── products/           # Product moderation
│   │   ├── orders/             # Order management
│   │   ├── sellers/            # Seller management
│   │   ├── categories/         # Category management
│   │   ├── moderation/         # Content moderation
│   │   ├── analytics/          # Platform analytics
│   │   └── settings/           # Platform settings
│   └── components/
│       ├── dashboard/          # Dashboard widgets
│       ├── tables/             # Data tables
│       └── forms/              # Admin forms
```

### Seller Application

```
apps/seller/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Seller dashboard
│   │   ├── products/           # Product management
│   │   ├── orders/             # Order fulfillment
│   │   ├── analytics/          # Sales analytics
│   │   ├── payouts/            # Payout management
│   │   └── settings/           # Store settings
│   └── components/
│       ├── dashboard/          # Dashboard components
│       └── products/           # Product management
```

### Shared Packages

```
packages/
├── ui/                         # Shared UI components
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── auth/           # Auth components
│   │   │   ├── security/       # Security components
│   │   │   └── seo/            # SEO components
│   │   ├── hooks/              # Shared hooks
│   │   └── lib/                # Utilities
│   └── package.json
├── config/                     # Shared configuration
│   ├── eslint.config.mjs
│   ├── tsconfig.base.json
│   ├── tsconfig.nextjs.json
│   └── tailwind.config.ts
└── convex/                     # Backend
    └── convex/
        ├── schema.ts           # Database schema
        ├── auth.ts             # Auth configuration
        ├── http.ts             # HTTP endpoints
        └── functions/          # Convex functions
            ├── products.ts
            ├── orders.ts
            ├── users.ts
            └── ...
```

---

## Data Flow

### Read Flow (Queries)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│  useQuery()  │────▶│ Convex Query │────▶│ Database │
│Component │     │    Hook      │     │   Function   │     │          │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
     ▲                                       │
     │                                       │
     └───────────────────────────────────────┘
              Real-time Subscription
```

### Write Flow (Mutations)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Client  │────▶│ useMutation()│────▶│   Convex     │────▶│ Database │
│  Action  │     │    Hook      │     │  Mutation    │     │          │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                             │
                                             ▼
                                    ┌──────────────┐
                                    │  Validation  │
                                    │  & Security  │
                                    └──────────────┘
```

### Server-Side Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │────▶│   Next.js    │────▶│   Convex     │
│              │     │   Server     │     │   Client     │
└──────────────┘     │  Component   │     │              │
                     └──────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐
                     │     HTML     │◀────│    Data      │
                     │   Response   │     │   Response   │
                     └──────────────┘     └──────────────┘
```

---

## Authentication Flow

### OAuth Sign-In Flow

```
┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  User  │────▶│  Sign In   │────▶│   OAuth    │────▶│  Provider  │
│        │     │   Button   │     │  Redirect  │     │(Google/GH) │
└────────┘     └────────────┘     └────────────┘     └────────────┘
                                                            │
                                                            ▼
┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│Session │◀────│   Create   │◀────│  Callback  │◀────│   Auth     │
│ Cookie │     │  Session   │     │  Handler   │     │  Response  │
└────────┘     └────────────┘     └────────────┘     └────────────┘
```

### Cross-Domain Session Sharing

```
┌─────────────────────────────────────────────────────────────────┐
│                    .createconomy.com Domain                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Marketplace │  │    Forum     │  │    Admin     │           │
│  │              │  │              │  │              │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│         └─────────────────┼─────────────────┘                    │
│                           │                                      │
│                    ┌──────┴───────┐                              │
│                    │   Shared     │                              │
│                    │   Session    │                              │
│                    │   Cookie     │                              │
│                    └──────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Session Validation

```typescript
// Session validation flow
async function validateSession(token: string) {
  // 1. Verify JWT signature
  const payload = await verifyJWT(token);
  
  // 2. Check session in database
  const session = await ctx.db.get(payload.sessionId);
  
  // 3. Validate expiration
  if (session.expiresAt < Date.now()) {
    throw new Error("Session expired");
  }
  
  // 4. Return user context
  return { userId: session.userId, role: session.role };
}
```

---

## Payment Flow

### Checkout Flow

```
┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Cart  │────▶│  Checkout  │────▶│  Stripe    │────▶│  Payment   │
│  Page  │     │   Page     │     │  Elements  │     │  Intent    │
└────────┘     └────────────┘     └────────────┘     └────────────┘
                                                            │
                                                            ▼
┌────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│Download│◀────│   Order    │◀────│  Webhook   │◀────│  Payment   │
│  Page  │     │  Created   │     │  Handler   │     │ Confirmed  │
└────────┘     └────────────┘     └────────────┘     └────────────┘
```

### Stripe Connect Payout Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      Payment Processing                         │
│                                                                 │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │ Customer │────▶│   Platform   │────▶│   Stripe     │        │
│  │ Payment  │     │   Account    │     │   Connect    │        │
│  └──────────┘     └──────────────┘     └──────────────┘        │
│                          │                    │                 │
│                          ▼                    ▼                 │
│                   ┌──────────────┐     ┌──────────────┐        │
│                   │  Platform    │     │   Seller     │        │
│                   │    Fee       │     │   Payout     │        │
│                   │   (10%)      │     │   (90%)      │        │
│                   └──────────────┘     └──────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

### Webhook Processing

```typescript
// Webhook handler structure
export const stripeWebhook = httpAction(async (ctx, request) => {
  // 1. Verify webhook signature
  const event = await verifyStripeSignature(request);
  
  // 2. Process event type
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSuccess(ctx, event.data);
      break;
    case "payment_intent.failed":
      await handlePaymentFailure(ctx, event.data);
      break;
    case "account.updated":
      await handleAccountUpdate(ctx, event.data);
      break;
  }
  
  // 3. Return acknowledgment
  return new Response("OK", { status: 200 });
});
```

---

## Multi-Tenancy Design

### Seller Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                        Platform Database                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Products Table                       │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ id │ sellerId │ name │ price │ status │ createdAt  │ │   │
│  │  ├────┼──────────┼──────┼───────┼────────┼────────────┤ │   │
│  │  │ 1  │ seller_1 │ ...  │ ...   │ active │ ...        │ │   │
│  │  │ 2  │ seller_2 │ ...  │ ...   │ active │ ...        │ │   │
│  │  │ 3  │ seller_1 │ ...  │ ...   │ draft  │ ...        │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Access Control                         │   │
│  │                                                           │   │
│  │  Seller A ──▶ Can only access sellerId = "seller_1"      │   │
│  │  Seller B ──▶ Can only access sellerId = "seller_2"      │   │
│  │  Admin    ──▶ Can access all records                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Access Patterns

```typescript
// Seller-scoped query
export const getSellerProducts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    const seller = await getSellerByUserId(ctx, identity.subject);
    
    // Only return products belonging to this seller
    return ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", seller._id))
      .collect();
  },
});

// Admin query (no seller filter)
export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("products").collect();
  },
});
```

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Layers                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 1: Edge Security                                   │   │
│  │  • Rate limiting                                          │   │
│  │  • DDoS protection                                        │   │
│  │  • WAF rules                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 2: Application Security                            │   │
│  │  • CSRF protection                                        │   │
│  │  • Input validation                                       │   │
│  │  • Security headers                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 3: Authentication & Authorization                  │   │
│  │  • JWT validation                                         │   │
│  │  • Role-based access control                              │   │
│  │  • Session management                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Layer 4: Data Security                                   │   │
│  │  • Encryption at rest                                     │   │
│  │  • Encryption in transit                                  │   │
│  │  • Data isolation                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Security Headers

```typescript
// Next.js security headers configuration
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

---

## Performance Considerations

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     Caching Layers                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CDN Cache (Vercel Edge)                                  │   │
│  │  • Static assets: 1 year                                  │   │
│  │  • ISR pages: configurable                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Browser Cache                                            │   │
│  │  • Static assets: immutable                               │   │
│  │  • API responses: no-store                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Convex Cache                                             │   │
│  │  • Query results: automatic                               │   │
│  │  • Real-time invalidation                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** | < 2.5s | Server components, image optimization |
| **FID** | < 100ms | Code splitting, minimal JS |
| **CLS** | < 0.1 | Reserved space, font loading |
| **TTFB** | < 600ms | Edge deployment, caching |

---

## Related Documentation

- [API Reference](./api-reference.md)
- [Security Guide](./security.md)
- [Contributing Guide](./contributing.md)
- [Troubleshooting](./troubleshooting.md)
