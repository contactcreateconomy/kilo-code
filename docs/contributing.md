# Contributing

> Guidelines for contributing to the Createconomy platform.

---

## Prerequisites

- Node.js >= 24, pnpm >= 10, Git

## Setup

```bash
git clone https://github.com/contactcreateconomy/kilo-code.git
cd kilo-code
pnpm install
cp .env.example .env.local  # fill in values
pnpm dev
```

---

## Branch Naming

Branches use a sequential numeric prefix: `NNN-type/description`. Check existing branches for the next number.

```
014-refactor/solid-cleanup
015-feature/user-notifications
016-fix/cart-total
```

Types: `feature`, `fix`, `docs`, `refactor`, `test`, `chore`, `hotfix`

---

## Commit Messages

[Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

Scopes: `marketplace`, `forum`, `admin`, `seller`, `ui`, `convex`, `config`

Examples:
```
feat(marketplace): add product search
fix(forum): correct thread pagination
docs(api): update auth endpoints
```

---

## Pull Request Process

### Before submitting

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds (or individual app build)
- [ ] Documentation updated if needed
- [ ] Branch is up to date with main

### PR format

Title follows commit message convention. Use the PR template in `.github/PULL_REQUEST_TEMPLATE.md`.

### Review → squash merge to main → delete branch.

---

## Coding Standards

See [conventions.md](./conventions.md) for full details. Key points:

- TypeScript strict mode, no `any`
- kebab-case files, PascalCase components, camelCase functions
- `@/` for intra-app imports, `@createconomy/*` for shared packages
- Server Components by default; `'use client'` only when needed
- React 19: `use()` not `useContext()`, `ref` prop not `forwardRef`
- Convex: use middleware wrappers from `lib/middleware.ts`
- Prices in cents (integer), soft-delete pattern, no `v.any()`

---

## Testing

- Unit/component tests: Vitest + React Testing Library
- Test files: `__tests__/*.test.ts(x)`
- Run: `pnpm test`, `pnpm test:coverage`
- New features should include tests; bug fixes should include regression tests
