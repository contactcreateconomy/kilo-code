# Tech Stack

> Complete technology reference for the Createconomy platform.

---

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.9+ |
| Runtime | Node.js | 24+ |
| Package Manager | pnpm | 10+ (10.28.2 pinned) |
| Monorepo | Turborepo | 2.8+ |
| Framework | Next.js (App Router) | 16.1+ |
| React | React | 19.2+ |
| Backend | Convex (serverless DB + functions) | 1.31+ |
| Auth | `@convex-dev/auth` (Google, GitHub OAuth) | 0.0.90+ |
| Payments | Stripe Connect + `stripe` SDK | 20.3+ |
| Styling | Tailwind CSS 4 + `tailwind-merge` | 4.1+ |
| UI Primitives | Radix UI | various |
| State (marketplace) | Zustand | 5.0+ |
| Animations (forum) | Framer Motion | 12.31+ |
| Charts (admin/seller) | Recharts | 2.15+ |
| Testing | Vitest + React Testing Library | 4.0+ / 16.3+ |
| Linting | ESLint 9 + typescript-eslint | 9.39+ |
| Formatting | Prettier + prettier-plugin-tailwindcss | 3.8+ |
| Deployment | Vercel (per-app) | — |

---

## Frontend

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: [TypeScript 5.9+](https://www.typescriptlang.org) (strict mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) with `tailwind-merge`
- **UI Components**: [Radix UI](https://www.radix-ui.com) primitives
- **State Management**: React Server Components + Convex (marketplace uses Zustand)
- **Animations**: Framer Motion (forum app)
- **Charts**: Recharts (admin + seller dashboards)

## Backend

- **Database & Functions**: [Convex](https://convex.dev) — serverless DB with real-time subscriptions, ACID transactions, automatic indexing
- **Authentication**: [`@convex-dev/auth`](https://labs.convex.dev/auth) with Google + GitHub OAuth
- **Payments**: [Stripe](https://stripe.com) with Connect for marketplace payouts
- **Cron Jobs**: Convex crons — hourly expired session cleanup, daily soft-delete record purge

## Infrastructure

- **Monorepo**: [Turborepo](https://turbo.build) with pnpm workspaces
- **Package Manager**: [pnpm 10+](https://pnpm.io) — **never** use npm or yarn
- **Deployment**: [Vercel](https://vercel.com) (per-app projects)
- **CI/CD**: GitHub Actions (type checking as required status check)
- **Bundler**: Turbopack (default in Next.js 16; webpack only for production builds)

## Testing

- **Unit/Integration**: [Vitest](https://vitest.dev) 4.0+
- **Component Testing**: [React Testing Library](https://testing-library.com/) 16.3+
- **Coverage**: Via `pnpm test:coverage`

## Code Quality

- **Linting**: ESLint 9 flat config with `typescript-eslint` (strict type-checked mode)
- **Formatting**: Prettier 3.8+ with `prettier-plugin-tailwindcss` for class sorting
- **Config**: Single quotes, semicolons, 100 char line width, trailing commas (es5)

---

## Related Docs

- [Architecture Overview](./architecture.md)
- [Conventions & Patterns](./conventions.md)
- [Commands Reference](./commands.md)
