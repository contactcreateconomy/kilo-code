# @createconomy/convex

Centralized Convex backend package for the Createconomy e-commerce platform.

## Overview

This package contains the shared Convex backend that powers all Createconomy applications:
- **Marketplace** - Main e-commerce storefront
- **Forum** - Community discussion platform
- **Admin** - Administrative dashboard
- **Seller** - Seller management portal

## Structure

```
packages/convex/
├── convex/
│   ├── _generated/       # Auto-generated Convex files (do not edit)
│   ├── convex.config.ts  # Convex app configuration
│   └── schema.ts         # Database schema definition
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Convex account and CLI

### Development

1. Install dependencies from the monorepo root:
   ```bash
   pnpm install
   ```

2. Start the Convex development server:
   ```bash
   pnpm --filter @createconomy/convex dev
   ```

3. The Convex dashboard will open automatically, and the `_generated` directory will be populated.

### Deployment

Deploy to production:
```bash
pnpm --filter @createconomy/convex deploy
```

## Schema

The database schema is defined in `convex/schema.ts`. The full schema will be implemented in Phase 3 of the project setup.

### Planned Tables

| Table | Description |
|-------|-------------|
| `users` | Extended user profiles (extends auth tables) |
| `products` | Digital products and assets |
| `orders` | Purchase orders and transactions |
| `reviews` | Product reviews and ratings |
| `categories` | Product categories and tags |
| `sellers` | Seller profiles and settings |
| `forum_posts` | Community forum posts |
| `forum_comments` | Forum post comments |

## Authentication

Authentication is handled by `@convex-dev/auth` which provides:
- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Session management
- User management

## Usage in Applications

Import Convex functions in your Next.js applications:

```typescript
// In your Next.js app
import { api } from "@createconomy/convex/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";

// Query data
const products = useQuery(api.products.list);

// Mutate data
const createProduct = useMutation(api.products.create);
```

## Environment Variables

Each application needs the following environment variables:

```env
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

## Contributing

When adding new Convex functions:

1. Create the function file in the `convex/` directory
2. Export the function using Convex's function builders
3. Run `pnpm dev` to regenerate types
4. Import and use in applications via the generated API

## License

Private - Createconomy Platform
