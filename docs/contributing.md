# Contributing Guide

> Guidelines for contributing to the Createconomy platform.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to:

- Be respectful and considerate in all interactions
- Welcome diverse perspectives and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that could be considered inappropriate in a professional setting

### Enforcement

Violations may result in temporary or permanent bans from the project. Report issues to conduct@createconomy.com.

---

## Getting Started

### Prerequisites

- Node.js >= 24.0.0
- pnpm >= 10.0.0
- Git
- A GitHub account

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/createconomy.git
   cd createconomy
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/createconomy/createconomy.git
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Fill in required values
   ```

5. **Start development**
   ```bash
   pnpm dev
   ```

---

## Development Workflow

### 1. Sync with Upstream

Before starting work, ensure your fork is up to date:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Write code following our [coding standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test --filter=@createconomy/ui

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## Branch Naming

Use descriptive branch names following this convention:

```
<type>/<description>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feature` | New feature | `feature/user-notifications` |
| `fix` | Bug fix | `fix/cart-total-calculation` |
| `docs` | Documentation | `docs/api-reference-update` |
| `refactor` | Code refactoring | `refactor/auth-module` |
| `test` | Adding tests | `test/product-service` |
| `chore` | Maintenance | `chore/update-dependencies` |
| `hotfix` | Critical fix | `hotfix/payment-processing` |

### Examples

```
feature/add-wishlist
fix/login-redirect-loop
docs/contributing-guide
refactor/product-queries
test/checkout-flow
chore/upgrade-next-15
```

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system changes |
| `ci` | CI/CD changes |
| `chore` | Other changes |
| `revert` | Revert a previous commit |

### Scopes

| Scope | Description |
|-------|-------------|
| `marketplace` | Marketplace app |
| `forum` | Forum app |
| `admin` | Admin app |
| `seller` | Seller app |
| `ui` | UI package |
| `convex` | Convex backend |
| `config` | Configuration |
| `deps` | Dependencies |

### Examples

```bash
# Feature
feat(marketplace): add product search functionality

# Bug fix
fix(cart): correct total calculation with discounts

# Documentation
docs(api): update authentication endpoints

# Breaking change
feat(auth)!: migrate to new session format

BREAKING CHANGE: Session tokens are now JWT-based.
Old sessions will be invalidated.

# Multiple scopes
feat(marketplace,seller): add product analytics
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Title

Follow the same format as commit messages:

```
feat(marketplace): add product filtering
```

### PR Description

Use the PR template and include:

1. **Summary**: Brief description of changes
2. **Motivation**: Why this change is needed
3. **Changes**: List of specific changes
4. **Testing**: How the changes were tested
5. **Screenshots**: If applicable
6. **Breaking Changes**: If any

### Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one approval required
3. **Merge**: Squash and merge to main

### After Merge

- Delete your feature branch
- Update your local main branch
- Close related issues

---

## Code Review Guidelines

### For Authors

- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Be open to suggestions
- Explain complex changes in comments

### For Reviewers

- Be constructive and respectful
- Explain the reasoning behind suggestions
- Approve when satisfied, don't block unnecessarily
- Use appropriate review comments:

| Prefix | Meaning |
|--------|---------|
| `nit:` | Minor suggestion, not blocking |
| `suggestion:` | Recommended improvement |
| `question:` | Seeking clarification |
| `issue:` | Must be addressed |

### Review Checklist

- [ ] Code is readable and well-organized
- [ ] Logic is correct and efficient
- [ ] Error handling is appropriate
- [ ] Security considerations addressed
- [ ] Tests cover the changes
- [ ] Documentation is updated
- [ ] No unnecessary changes

---

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Use interfaces for objects
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// Use type for unions/intersections
type Status = "pending" | "active" | "completed";

// Prefer const assertions
const ROLES = ["user", "seller", "admin"] as const;
type Role = (typeof ROLES)[number];
```

### React Components

```tsx
// Use function components with TypeScript
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### File Organization

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                 # Generic UI components
│   └── features/           # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript types
└── styles/                 # Global styles
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `product-card.tsx` |
| Components | PascalCase | `ProductCard` |
| Functions | camelCase | `calculateTotal` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_ITEMS` |
| Types/Interfaces | PascalCase | `ProductData` |
| CSS classes | kebab-case | `product-card` |

### Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. External packages
import { useQuery } from "convex/react";
import { z } from "zod";

// 3. Internal packages
import { Button } from "@createconomy/ui/components/button";
import { api } from "@createconomy/convex";

// 4. Relative imports
import { ProductCard } from "./product-card";
import { formatPrice } from "../lib/utils";

// 5. Types
import type { Product } from "../types";
```

---

## Testing Requirements

### Test Coverage

- New features must include tests
- Bug fixes should include regression tests
- Aim for >80% coverage on critical paths

### Test Types

| Type | Location | Purpose |
|------|----------|---------|
| Unit | `__tests__/*.test.ts` | Test individual functions |
| Component | `__tests__/*.test.tsx` | Test React components |
| Integration | `__tests__/integration/` | Test feature workflows |
| E2E | `e2e/` | Test full user flows |

### Writing Tests

```typescript
// Unit test example
import { describe, it, expect } from "vitest";
import { formatPrice } from "../lib/utils";

describe("formatPrice", () => {
  it("formats cents to dollars", () => {
    expect(formatPrice(1000)).toBe("$10.00");
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles large amounts", () => {
    expect(formatPrice(999999)).toBe("$9,999.99");
  });
});
```

```tsx
// Component test example
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../components/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/lib/__tests__/utils.test.ts
```

---

## Questions?

- Check existing [issues](https://github.com/createconomy/createconomy/issues)
- Start a [discussion](https://github.com/createconomy/createconomy/discussions)
- Join our [Discord](https://discord.gg/createconomy)

Thank you for contributing to Createconomy! 🎉
