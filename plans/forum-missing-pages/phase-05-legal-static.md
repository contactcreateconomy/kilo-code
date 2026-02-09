# Phase 05 — Legal & Static Pages

Missing legal, informational, and static pages expected by a production community platform.

---

## 5.1 `/terms` — Terms of Service

**Severity**: 🟡 Medium — Legally required, linked from sign-in

**What it needs**: Static page with Terms of Service content, server component with SEO metadata.

---

## 5.2 `/privacy` — Privacy Policy

**Severity**: 🟡 Medium — Legally required, linked from sign-in

**What it needs**: Static page with Privacy Policy content, server component with SEO metadata.

---

## 5.3 `/guidelines` or `/rules` — Community Guidelines

**Severity**: 🟡 Medium — Important for content moderation

**What it needs**:
- Clear community rules
- Linked from report dialog, moderation actions, and footer
- Explains what constitutes spam, harassment, hate speech, etc.
- The [`report-dialog.tsx`](../../apps/forum/src/components/moderation/report-dialog.tsx) shows report reasons but users need a reference for community standards

---

## 5.4 `/about` — About Page

**Severity**: 🟢 Low — Standard for community platforms

**What it needs**:
- Platform description and mission
- Team / creator info
- Contact information
- Links to social media

---

## 5.5 `/contact` or `/feedback` — Contact / Feedback Page

**Severity**: 🟢 Low — Nice to have

**What it needs**:
- Contact form or support email display
- Bug report option
- Feature request option

---

## 5.6 `/faq` — Frequently Asked Questions

**Severity**: 🟢 Low — Helpful for new users

**What it needs**:
- Accordion-style FAQ
- How to create threads, earn reputation, report content
- Account-related questions

---

## 5.7 Footer Component — Missing or Incomplete

**Severity**: 🟢 Low — Standard layout element

**Current state**: A [`footer.tsx`](../../apps/forum/src/components/layout/footer.tsx) component exists. It likely needs to link to the legal and static pages above.

**What it needs**: Links to Terms, Privacy, Guidelines, About, Contact, FAQ.

---

## Implementation Checklist

- [ ] Create `/terms` page
- [ ] Create `/privacy` page  
- [ ] Create `/guidelines` community rules page
- [ ] Create `/about` page
- [ ] Optionally create `/contact` or `/feedback` page
- [ ] Optionally create `/faq` page
- [ ] Update footer component with links to all static pages
- [ ] Add sitemap entries for all new static pages in [`sitemap.ts`](../../apps/forum/src/app/sitemap.ts)
- [ ] Add robots metadata for static pages
