# Local Development Guide

This guide covers setting up and running the Createconomy platform locally.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [pnpm](https://pnpm.io/) v9 or later
- [Git](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/createconomy.git
cd createconomy
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment files:

```bash
# Root level
cp .env.example .env.local

# Each app
cp apps/marketplace/.env.example apps/marketplace/.env.local
cp apps/forum/.env.example apps/forum/.env.local
cp apps/admin/.env.example apps/admin/.env.local
cp apps/seller/.env.example apps/seller/.env.local
```

### 4. Configure Services

#### Convex Database

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Create a new project
3. Copy the deployment URL to `NEXT_PUBLIC_CONVEX_URL`

```bash
# Initialize Convex
cd packages/convex
npx convex dev
```

#### Stripe (for Marketplace & Seller)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the Dashboard
3. Set up Stripe Connect for the seller portal

```bash
# In .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

### 5. Start Development Servers

Run all apps simultaneously:

```bash
pnpm dev
```

Or run specific apps:

```bash
# Run only marketplace
pnpm dev --filter=@createconomy/marketplace

# Run marketplace and forum
pnpm dev --filter=@createconomy/marketplace --filter=@createconomy/forum
```

## Application URLs

| Application | URL | Port |
|-------------|-----|------|
| Marketplace | http://localhost:3000 | 3000 |
| Forum | http://localhost:3001 | 3001 |
| Admin | http://localhost:3002 | 3002 |
| Seller | http://localhost:3003 | 3003 |

## Project Structure

```
createconomy/
├── apps/
│   ├── marketplace/     # Main marketplace (port 3000)
│   ├── forum/           # Community forum (port 3001)
│   ├── admin/           # Admin dashboard (port 3002)
│   └── seller/          # Seller portal (port 3003)
├── packages/
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configurations
│   └── convex/          # Convex database schema & functions
├── docs/                # Documentation
├── scripts/             # Deployment & utility scripts
└── turbo.json           # Turborepo configuration
```

## Development Workflow

### Running Commands

```bash
# Development
pnpm dev                 # Start all apps
pnpm dev --filter=app    # Start specific app

# Building
pnpm build               # Build all apps
pnpm build --filter=app  # Build specific app

# Linting
pnpm lint                # Lint all packages
pnpm lint --filter=app   # Lint specific package

# Type Checking
pnpm typecheck           # Type check all packages

# Formatting
pnpm format              # Format all files
pnpm format:check        # Check formatting

# Cleaning
pnpm clean               # Clean all build artifacts
```

### Working with Packages

#### UI Package

The shared UI package contains reusable components:

```bash
cd packages/ui
pnpm dev  # Watch mode for development
```

Import components in apps:

```tsx
import { Button, Card } from '@createconomy/ui';
```

#### Convex Package

The Convex package contains database schema and functions:

```bash
cd packages/convex
npx convex dev  # Start Convex development server
```

### Hot Reloading

All apps support hot reloading. Changes to:
- App code → Instant refresh
- Shared packages → Automatic rebuild and refresh
- Convex functions → Automatic deployment to dev environment

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm test --filter=@createconomy/marketplace

# Run tests in watch mode
pnpm test -- --watch
```

### E2E Testing

```bash
# Run Playwright tests
pnpm test:e2e

# Run with UI
pnpm test:e2e --ui
```

## Debugging

### VS Code

Launch configurations are provided in `.vscode/launch.json`:

1. Open VS Code
2. Go to Run and Debug (Ctrl+Shift+D)
3. Select the app to debug
4. Press F5

### Browser DevTools

- React DevTools: Install browser extension
- Convex Dashboard: Visit [dashboard.convex.dev](https://dashboard.convex.dev)

### Logging

```typescript
// Server-side logging
console.log('Server log');

// Client-side logging
console.log('Client log');

// Convex function logging
console.log('Convex log'); // Visible in Convex dashboard
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

Or change the port in the app's `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -p 3010"
  }
}
```

### Dependency Issues

```bash
# Clear node_modules and reinstall
pnpm clean
rm -rf node_modules
pnpm install
```

### Turborepo Cache Issues

```bash
# Clear Turbo cache
rm -rf .turbo
rm -rf node_modules/.cache
```

### Convex Connection Issues

1. Check `NEXT_PUBLIC_CONVEX_URL` is set correctly
2. Ensure Convex dev server is running
3. Check Convex dashboard for errors

### Stripe Webhook Issues

For local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Environment Variables Reference

### Required for All Apps

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | `https://xxx.convex.cloud` |
| `AUTH_SECRET` | Auth.js secret | `openssl rand -base64 32` |

### Marketplace

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |

### Seller

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Connect client ID |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Connect webhook secret |

### Admin

| Variable | Description |
|----------|-------------|
| `ADMIN_ALLOWED_EMAILS` | Comma-separated admin emails |

## IDE Setup

### VS Code Extensions

Recommended extensions (`.vscode/extensions.json`):

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Prisma (if using)

### Settings

Recommended settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Getting Help

- Check the [Deployment Guide](./deployment.md)
- Review [Architecture Documentation](../plans/createconomy-platform-architecture.md)
- Open an issue on GitHub
- Ask in the team Slack channel
