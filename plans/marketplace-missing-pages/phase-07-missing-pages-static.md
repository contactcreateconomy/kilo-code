# Phase 07 — Static & Policy Pages

## Goal

Create the missing static and policy pages that are linked from the footer. These are important for legal compliance, user trust, and SEO.

---

## Task 1: Create About Page

**File:** `apps/marketplace/src/app/about/page.tsx` (new)

**Content:**
- Company story / mission statement
- Team section (optional)
- How it works section
- Stats and milestones
- CTA to start browsing or selling
- Static metadata

---

## Task 2: Create Contact Page

**File:** `apps/marketplace/src/app/contact/page.tsx` (new)

**Content:**
- Contact form with fields:
  - Name
  - Email
  - Subject (dropdown: General, Support, Billing, Partnership)
  - Message
- Company contact details (email, social links)
- FAQ quick links
- The form can use a simple email API or store submissions in Convex

---

## Task 3: Create Terms of Service Page

**File:** `apps/marketplace/src/app/terms/page.tsx` (new)

**Content:**
- Standard terms of service for a digital marketplace
- Sections:
  - Acceptance of Terms
  - Account Registration
  - Buyer Terms
  - Seller Terms
  - Intellectual Property
  - Payment and Refunds
  - Prohibited Content
  - Limitation of Liability
  - Dispute Resolution
  - Changes to Terms
- Last updated date
- Static metadata

---

## Task 4: Create Privacy Policy Page

**File:** `apps/marketplace/src/app/privacy/page.tsx` (new)

**Content:**
- Standard privacy policy
- Sections:
  - Information We Collect
  - How We Use Information
  - Information Sharing
  - Data Security
  - Cookies
  - Third-Party Services (Stripe, analytics)
  - Your Rights (GDPR, CCPA)
  - Contact Information
- Last updated date
- Static metadata

---

## Task 5: Create Refund Policy Page

**File:** `apps/marketplace/src/app/refunds/page.tsx` (new)

**Content:**
- Refund policy for digital products
- Sections:
  - Eligibility for Refunds
  - Refund Process
  - Non-Refundable Items
  - Dispute Resolution
  - Seller-Specific Policies
  - How to Request a Refund
- Static metadata

---

## Task 6: Create Support Page

**File:** `apps/marketplace/src/app/support/page.tsx` (new)

**Why Needed:** The checkout success page has a "Contact Support" link to `/support`.

**Content:**
- Help center landing page
- FAQ sections:
  - Buying (payment, downloads, refunds)
  - Selling (getting started, payments, policies)
  - Account (profile, security, deletion)
- Search bar for help articles
- Contact support CTA (links to `/contact`)
- Common issue cards with quick actions

---

## Task 7: Create Blog Page (placeholder)

**File:** `apps/marketplace/src/app/blog/page.tsx` (new)

**Content:**
- Coming soon page or placeholder
- "Subscribe to updates" email input
- This can be a minimal placeholder since blog is low priority

---

## Task 8: Create Careers Page (placeholder)

**File:** `apps/marketplace/src/app/careers/page.tsx` (new)

**Content:**
- Coming soon page or minimal content
- Company values
- Link to contact for inquiries
- This can be a minimal placeholder since careers is low priority

---

## Design Notes

All static pages should follow consistent layout:
- Use `container` wrapper with proper `py-8` padding
- Include breadcrumbs
- Use markdown-like typography with `prose` classes or manual heading styles
- Include proper metadata for SEO
- Consistent page header pattern (title + description)

---

## Files Created

| File | Change Type |
|------|------------|
| `src/app/about/page.tsx` | New |
| `src/app/contact/page.tsx` | New |
| `src/app/terms/page.tsx` | New |
| `src/app/privacy/page.tsx` | New |
| `src/app/refunds/page.tsx` | New |
| `src/app/support/page.tsx` | New |
| `src/app/blog/page.tsx` | New (placeholder) |
| `src/app/careers/page.tsx` | New (placeholder) |
