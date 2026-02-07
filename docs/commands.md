# Commands Reference

> All available CLI commands for the Createconomy platform.

---

## Development

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies. Must use pnpm 10+. **Never** use npm/yarn. |
| `pnpm dev` | Run all apps via Turborepo |
| `pnpm --filter @createconomy/marketplace dev` | Run a single app (replace with app name) |
| `cd packages/convex && npx convex dev` | Start Convex backend (required for type generation and live sync) |

---

## Building

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all apps |
| `pnpm --filter @createconomy/admin build` | Build a single app |

---

## Code Quality

| Command | Description |
|---------|-------------|
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | TypeScript type checking across all packages |
| `pnpm format` | Format with Prettier + Tailwind sort |
| `pnpm format:check` | Check formatting (CI-friendly) |

---

## Testing

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests (Vitest) |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:watch` | Run tests in watch mode |

---

## Deployment

| Command | Description |
|---------|-------------|
| `cd packages/convex && npx convex deploy` | Deploy Convex backend |
| Per-app Vercel project | Each app has own `vercel.json` |

---

## Maintenance

| Command | Description |
|---------|-------------|
| `pnpm clean` | Remove `.turbo`, `.next`, `node_modules` |

---

## Development URLs

| Application | URL |
|-------------|-----|
| Marketplace | http://localhost:3000 |
| Forum | http://localhost:3001 |
| Admin | http://localhost:3002 |
| Seller | http://localhost:3003 |

---

## Convex CLI

| Command | Description |
|---------|-------------|
| `npx convex dev` | Start Convex dev server (generates types, live sync) |
| `npx convex dev --once` | Initialize Convex project (first time only) |
| `npx convex deploy` | Deploy to production |
| `npx convex logs` | View recent logs |
| `npx convex logs --follow` | Stream logs in real-time |

---

## Stripe CLI (Local Development)

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop install stripe

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Related Docs

- [Local Development](./local-development.md)
- [Environment & Configuration](./environment.md)
- [Deployment Guide](./deployment.md)
