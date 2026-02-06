# Createconomy - AI Agent Guidelines

> Instructions for AI coding assistants working with this codebase.

---

## Project Overview

Createconomy is a **digital marketplace platform** connecting creators with consumers. It's a Turborepo monorepo with multiple Next.js 15 applications and shared packages.

### Key Facts

- **Language**: TypeScript 5.7+
- **Runtime**: Node.js 24+
- **Package Manager**: pnpm 10+
- **Framework**: Next.js 16 with App Router
- **Backend**: Convex (serverless functions + database)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Payments**: Stripe Connect

---

## Code Style

### TypeScript

- Use strict TypeScript with no `any` types
- Prefer interfaces over types for object shapes
- Use explicit return types for exported functions
- Use `const` assertions for literal types

### React & Next.js

- Use Server Components by default; add `'use client'` only when needed
- Prefer `async` Server Components for data fetching
- Use the `use()` hook instead of `useContext()` (React 19)
- Don't use `forwardRef`; pass `ref` as a regular prop (React 19)
- Use functional components with hooks, no class components

### Naming Conventions

- **Files**: kebab-case (e.g., `user-profile.tsx`, `auth-guard.tsx`)
- **Components**: PascalCase (e.g., `UserProfile`, `AuthGuard`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `useAdmin`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants
- **Variables/Functions**: camelCase

### Imports

- Use absolute imports with path aliases (e.g., `@/components/...`)
- Import from package exports, not internal paths
- Import UI components from `@createconomy/ui`
- Import Convex functions from `@createconomy/convex`

### Code Formatting

- Run `pnpm format` before committing
- Use Prettier configuration from `.prettierrc`
- Maximum line length: 100 characters
- Use single quotes for strings
- Use semicolons

---

## Architecture

### Monorepo Structure

```
apps/
├── marketplace/     # Main storefront (port 3000)
├── forum/           # Community discussions (port 3001)
├── admin/           # Admin dashboard (port 3002)
└── seller/          # Seller portal (port 3003)

packages/
├── ui/              # Shared UI components (@createconomy/ui)
├── convex/          # Backend functions & schema (@createconomy/convex)
└── config/          # Shared ESLint, TypeScript, Tailwind configs
```

### Application Architecture

Each Next.js app follows this structure:

```
src/
├── app/             # App Router pages and layouts
│   ├── api/         # API routes
│   └── (groups)/    # Route groups
├── components/      # App-specific components
├── hooks/           # App-specific hooks
├── lib/             # Utilities and configurations
├── providers/       # Context providers
└── types/           # Type definitions
```

### Convex Backend

- Schema defined in `packages/convex/convex/schema.ts`
- Functions organized by domain (e.g., `products.ts`, `orders.ts`)
- Use `query` for reads, `mutation` for writes, `action` for external APIs
- Authentication via `@convex-dev/auth`

### Data Flow

1. Client components use Convex React hooks (`useQuery`, `useMutation`)
2. Server components use `fetchQuery` from Convex
3. All data mutations go through Convex mutations
4. Stripe webhooks handled via Convex HTTP actions

---

## Testing

### Test Framework

- Use Vitest for unit and integration tests
- Use React Testing Library for component tests
- Test files: `*.test.ts` or `*.test.tsx`

### What to Test

- Convex functions (queries, mutations)
- React hooks with complex logic
- UI components with user interactions
- Utility functions

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage
pnpm test:watch        # Watch mode
```

---

## Security

### Authentication

- All protected routes require authentication
- Use Convex Auth for session management
- Never expose auth tokens in client code
- Validate user permissions in Convex functions

### Authorization

- Check user roles before sensitive operations
- Use middleware for route protection
- Implement row-level security in Convex

### Data Handling

- Never log sensitive data (passwords, tokens, PII)
- Sanitize user inputs
- Use parameterized queries (Convex handles this)
- Validate all API inputs with schemas

### Environment Variables

- Never commit `.env` files
- Use `.env.example` for documentation
- Prefix client-exposed vars with `NEXT_PUBLIC_`
- Keep secrets in environment variables, not code

---

## Development Workflow

### Before Making Changes

1. Run `pnpm install` if dependencies changed
2. Check for running Convex dev server
3. Understand the existing patterns in the codebase

### Making Changes

1. Follow existing code patterns and conventions
2. Add types for all new code
3. Update tests for changed functionality
4. Run `pnpm typecheck` and `pnpm lint`

### Convex Changes

1. Modify schema in `packages/convex/convex/schema.ts`
2. Run `npx convex dev` to generate types
3. Update related queries and mutations
4. Test with Convex dashboard

### Creating New Components

1. Place shared components in `packages/ui/src/components`
2. Place app-specific components in `apps/<app>/src/components`
3. Export from package using `exports` in `package.json`
4. Add stories/tests as needed

---

## Common Patterns

### Data Fetching (Server Component)

```tsx
import { fetchQuery } from 'convex/nextjs'
import { api } from '@createconomy/convex'

export default async function ProductPage({ params }: Props) {
  const product = await fetchQuery(api.products.get, { id: params.id })
  return <ProductDetails product={product} />
}
```

### Data Fetching (Client Component)

```tsx
'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@createconomy/convex'

export function ProductList() {
  const products = useQuery(api.products.list)
  const addProduct = useMutation(api.products.create)
  // ...
}
```

### Protected Routes

```tsx
// middleware.ts
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}
```

---

## Constraints

### Do Not

- Don't use `any` type
- Don't mutate state directly
- Don't use `var` (use `const` or `let`)
- Don't commit without running lint/typecheck
- Don't hardcode environment-specific values
- Don't use deprecated React APIs (forwardRef, useContext)

### Always

- Always use TypeScript
- Always handle loading and error states
- Always validate user inputs
- Always use Convex for data operations
- Always follow the established file structure

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Stripe Documentation](https://stripe.com/docs)
- [Radix UI Documentation](https://radix-ui.com/primitives)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
