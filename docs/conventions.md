# Conventions & Patterns

> Naming, coding, and architectural conventions for the Createconomy platform.

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-profile.tsx`, `auth-guard.tsx` |
| Components | PascalCase | `UserProfile`, `AuthGuard` |
| Hooks | camelCase + `use` prefix | `useAuth`, `useCart` |
| Constants | SCREAMING_SNAKE_CASE | `PRODUCT_LIMITS`, `SESSION_CONFIG` |
| Variables/Functions | camelCase | `getProduct`, `handleClick` |
| Slugs | lowercase + hyphens | `my-product-2024` (validated by `SLUG_PATTERN`) |

---

## Import Conventions

- Use path alias `@/` for intra-app imports (maps to `./src/`)
- Import shared UI: `import { Button } from '@createconomy/ui'`
- Import Convex API: `import { api } from '@createconomy/convex'`
- Import Convex hooks: `import { useQuery, useMutation } from 'convex/react'`
- Use `type` imports: `import type { Id } from './_generated/dataModel'`
- ESLint enforces `consistent-type-imports` with `inline-type-imports` style

### Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { useQuery } from 'convex/react';
import { z } from 'zod';

// 3. Internal packages
import { Button } from '@createconomy/ui/components/button';
import { api } from '@createconomy/convex';

// 4. Relative imports
import { ProductCard } from './product-card';
import { formatPrice } from '../lib/utils';

// 5. Types
import type { Product } from '../types';
```

---

## React & Next.js Patterns

- **Server Components by default**; add `'use client'` only when needed
- Use `use()` hook instead of `useContext()` (React 19)
- Do **not** use `forwardRef`; pass `ref` as a regular prop (React 19)
- No class components — functional components with hooks only
- Each app wraps children in `ThemeProvider` → `ConvexProvider` in root layout
- Handle loading and error states in all UI components

---

## Convex Patterns

- `query` for reads, `mutation` for writes, `action` for external API calls
- Use auth middleware wrappers from `lib/middleware.ts`:
  - `authenticatedQuery`, `authenticatedMutation` — inject `ctx.userId` automatically
  - `adminQuery`, `adminMutation` — require admin role
  - `sellerQuery`, `sellerMutation` — require seller role
- User-facing errors: `throw createError(ErrorCode.NOT_FOUND, 'message')` from `lib/errors.ts`
- System errors: plain `throw new Error('message')` — never reaches client
- Queries returning "not found": return `null` (not an error)
- **Soft-delete pattern**: set `isDeleted: true, deletedAt: Date.now()` — never hard-delete from client code
- Rate limiting: use `checkRateLimitWithDb()` in mutations — writes to `rateLimitRecords` table
- All prices stored in **cents** (integer). Use `lib/stripe.ts` helpers for conversion.

---

## File Organization (Per App)

```
src/
  app/           → App Router pages, layouts, route groups, API routes
  components/    → App-specific components (auth/, layout/, domain/)
  hooks/         → App-specific hooks
  lib/           → Utilities (convex.ts, stripe.ts, utils.ts)
  providers/     → Context providers (convex-provider.tsx, theme-provider.tsx)
  types/         → Type definitions
  middleware.ts  → Route protection, security headers, CORS
```

---

## Formatting Rules

- Prettier config in `.prettierrc`: single quotes, semicolons, 100 char line width, trailing commas (es5)
- `prettier-plugin-tailwindcss` auto-sorts Tailwind classes
- Run `pnpm format` before committing

---

## Rules of Engagement

### Always

- Use TypeScript with strict mode. No `any` types.
- Validate all user inputs — both via Convex argument validators and business logic in handlers.
- Use Convex for all data operations. Never write to DB from client or Next.js API routes directly.
- Use `createError(ErrorCode.*, message)` for all user-facing errors in Convex functions.
- Follow established file structure: shared → `packages/ui`, app-specific → `apps/<app>/src/components`.
- Prefix client-exposed env vars with `NEXT_PUBLIC_`.
- Run `pnpm format` and `pnpm typecheck` before committing.
- Use auth middleware wrappers for new Convex functions.
- Use `isDeleted: true` for deletion. Never hard-delete user-facing records.

### Never

- Edit `convex/_generated/` files.
- Use `var`. Use `const` or `let`.
- Use deprecated React APIs (`forwardRef`, `useContext` — use `ref` prop and `use()` instead).
- Hardcode environment-specific values. Use env vars.
- Use `v.any()` in schema validators.
- Commit `.env` / `.env.local` files.
- Use npm/yarn. Only pnpm.
- Bypass Convex for data mutations (no direct REST API writes).
- Store prices in dollars/floats. Always cents (integer).
- Log sensitive data (passwords, tokens, PII) in Convex functions.

---

## Related Docs

- [Tech Stack](./tech-stack.md)
- [Architecture Overview](./architecture.md)
- [Contributing Guide](./contributing.md)
- [Commands Reference](./commands.md)
