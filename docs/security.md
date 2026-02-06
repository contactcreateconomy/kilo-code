# Security Guide

> Security measures and best practices for the Createconomy platform.

---

## Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [CSRF Protection](#csrf-protection)
- [Rate Limiting](#rate-limiting)
- [Security Headers](#security-headers)
- [Input Validation](#input-validation)
- [Payment Security](#payment-security)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

---

## Overview

Security is a core principle of the Createconomy platform. We implement defense-in-depth strategies across all layers of the application.

### Security Principles

1. **Least Privilege**: Users and services only have access to what they need
2. **Defense in Depth**: Multiple layers of security controls
3. **Fail Secure**: Systems fail in a secure state
4. **Zero Trust**: Verify every request, regardless of source
5. **Security by Default**: Secure configurations out of the box

---

## Authentication & Authorization

### Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   User   │────▶│  OAuth 2.0   │────▶│   Provider   │
│          │     │   Request    │     │ (Google/GH)  │
└──────────┘     └──────────────┘     └──────────────┘
                                             │
                                             ▼
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Session │◀────│   Convex     │◀────│   Callback   │
│  Cookie  │     │    Auth      │     │   Handler    │
└──────────┘     └──────────────┘     └──────────────┘
```

### Session Management

- **Session Storage**: Secure, HTTP-only cookies
- **Session Duration**: 7 days with sliding expiration
- **Session Invalidation**: On logout, password change, or security events
- **Cross-Domain Sessions**: Shared via `.createconomy.com` domain cookie

```typescript
// Session cookie configuration
const sessionConfig = {
  name: "__session",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  domain: ".createconomy.com",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **User** | Browse, purchase, review, forum participation |
| **Seller** | User permissions + product management, order fulfillment |
| **Admin** | All permissions + user management, moderation, analytics |

```typescript
// Authorization helper
export async function requireRole(ctx: QueryCtx, role: UserRole) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("UNAUTHORIZED: Authentication required");
  }
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
    .unique();
    
  if (!user || !hasRole(user.role, role)) {
    throw new Error("FORBIDDEN: Insufficient permissions");
  }
  
  return user;
}
```

---

## Data Protection

### Encryption

#### In Transit
- All traffic uses TLS 1.3
- HSTS enabled with preload
- Certificate pinning for mobile apps

#### At Rest
- Convex encrypts all data at rest
- Sensitive fields use additional application-level encryption
- File storage encrypted with AES-256

### Sensitive Data Handling

```typescript
// Never log sensitive data
const sanitizeForLogging = (data: Record<string, unknown>) => {
  const sensitiveFields = ["password", "token", "secret", "apiKey", "cardNumber"];
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sensitiveFields.some((f) => key.toLowerCase().includes(f))
        ? "[REDACTED]"
        : value,
    ])
  );
};
```

### Data Retention

| Data Type | Retention Period | Deletion Method |
|-----------|------------------|-----------------|
| User accounts | Until deletion request | Soft delete, then hard delete after 30 days |
| Order history | 7 years (legal requirement) | Archived after 2 years |
| Session data | 7 days | Automatic expiration |
| Logs | 90 days | Automatic rotation |

---

## CSRF Protection

### Implementation

```typescript
// packages/ui/src/components/security/csrf-token.tsx
"use client";

import { useEffect, useState } from "react";

export function CSRFToken() {
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Generate CSRF token
    const generateToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    };

    const existingToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];

    if (!existingToken) {
      const newToken = generateToken();
      document.cookie = `csrf_token=${newToken}; path=/; SameSite=Strict`;
      setToken(newToken);
    } else {
      setToken(existingToken);
    }
  }, []);

  return <input type="hidden" name="_csrf" value={token} />;
}
```

### Validation

```typescript
// Middleware CSRF validation
export function validateCSRF(request: Request): boolean {
  const cookieToken = request.cookies.get("csrf_token")?.value;
  const headerToken = request.headers.get("X-CSRF-Token");
  const bodyToken = request.body?._csrf;

  const token = headerToken || bodyToken;
  
  if (!cookieToken || !token) {
    return false;
  }

  return timingSafeEqual(cookieToken, token);
}
```

---

## Rate Limiting

### Configuration

```typescript
// packages/ui/src/lib/rate-limit.ts
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimits: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  "auth:login": { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  "auth:register": { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  "auth:password-reset": { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  
  // API endpoints
  "api:read": { windowMs: 60 * 1000, maxRequests: 1000 },
  "api:write": { windowMs: 60 * 1000, maxRequests: 100 },
  
  // File uploads
  "upload:file": { windowMs: 60 * 60 * 1000, maxRequests: 50 },
};
```

### Implementation

```typescript
// Rate limiter using sliding window
export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.resetAt < now) {
      this.store.set(key, { count: 1, resetAt: now + config.windowMs });
      return { allowed: true, remaining: config.maxRequests - 1 };
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      };
    }

    record.count++;
    return { allowed: true, remaining: config.maxRequests - record.count };
  }
}
```

---

## Security Headers

### Next.js Configuration

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self' data:;
      connect-src 'self' https://*.convex.cloud https://api.stripe.com wss://*.convex.cloud;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      upgrade-insecure-requests;
    `.replace(/\s+/g, " ").trim(),
  },
];

export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Input Validation

### Schema Validation with Zod

```typescript
// packages/ui/src/lib/schemas/product.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Name contains invalid characters"),
  
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(1000000, "Price exceeds maximum"),
  
  categoryId: z.string().regex(/^[a-z0-9]+$/, "Invalid category ID"),
});

export type ProductInput = z.infer<typeof productSchema>;
```

### Server-Side Validation

```typescript
// Convex mutation with validation
export const createProduct = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    // Validate with schema
    const validated = productSchema.parse(args);
    
    // Sanitize HTML content
    const sanitizedDescription = sanitizeHtml(validated.description, {
      allowedTags: ["b", "i", "em", "strong", "p", "br"],
      allowedAttributes: {},
    });
    
    // Check for malicious content
    if (containsMaliciousContent(validated.name)) {
      throw new Error("VALIDATION_ERROR: Invalid content detected");
    }
    
    return ctx.db.insert("products", {
      ...validated,
      description: sanitizedDescription,
    });
  },
});
```

### XSS Prevention

```typescript
// Sanitize user-generated content
import DOMPurify from "isomorphic-dompurify";

export function sanitizeUserContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

// Always escape when rendering
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

---

## Payment Security

### Stripe Integration

```typescript
// Server-side payment intent creation
export const createPaymentIntent = action({
  args: { amount: v.number(), currency: v.string() },
  handler: async (ctx, { amount, currency }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    
    // Validate amount
    if (amount < 50 || amount > 99999999) {
      throw new Error("Invalid payment amount");
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        // Include order reference for reconciliation
        orderId: ctx.orderId,
      },
    });
    
    return { clientSecret: paymentIntent.client_secret };
  },
});
```

### Webhook Verification

```typescript
// Verify Stripe webhook signatures
export const stripeWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();
  
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Process event...
    
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }
});
```

### PCI Compliance

- **No card data storage**: All payment data handled by Stripe
- **Stripe Elements**: Client-side card input never touches our servers
- **Tokenization**: Only payment tokens are transmitted
- **TLS encryption**: All payment communications encrypted

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **Critical** | Active breach, data exposure | Immediate | Data leak, unauthorized access |
| **High** | Potential breach, vulnerability | < 4 hours | SQL injection, auth bypass |
| **Medium** | Security weakness | < 24 hours | Missing headers, weak config |
| **Low** | Minor issue | < 1 week | Informational disclosure |

### Response Procedure

1. **Detection**: Identify and confirm the incident
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove the threat
4. **Recovery**: Restore normal operations
5. **Post-Incident**: Document and improve

### Contact Information

- **Security Team**: security@createconomy.com
- **Emergency Hotline**: Available to authorized personnel
- **Bug Bounty**: See [SECURITY.md](../SECURITY.md)

---

## Security Checklist

### Development

- [ ] All inputs validated and sanitized
- [ ] Authentication required for protected routes
- [ ] Authorization checks on all mutations
- [ ] Sensitive data not logged
- [ ] Dependencies regularly updated
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented

### Deployment

- [ ] Environment variables secured
- [ ] TLS certificates valid
- [ ] Database access restricted
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Incident response plan documented

### Code Review

- [ ] No hardcoded secrets
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper error handling (no stack traces exposed)
- [ ] Secure session management
- [ ] Proper access control

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [API Reference](./api-reference.md)
- [Conventions & Patterns](./conventions.md)
- [Contributing Guide](./contributing.md)
- [Security Policy](../SECURITY.md)
