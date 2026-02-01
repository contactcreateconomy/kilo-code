# Troubleshooting Guide

> Common issues and solutions for the Createconomy platform.

---

## Table of Contents

- [Development Issues](#development-issues)
- [Build Issues](#build-issues)
- [Authentication Issues](#authentication-issues)
- [Database Issues](#database-issues)
- [Payment Issues](#payment-issues)
- [Deployment Issues](#deployment-issues)
- [Debug Mode](#debug-mode)
- [Log Locations](#log-locations)
- [Getting Help](#getting-help)

---

## Development Issues

### Installation Fails

#### Problem: `pnpm install` fails with dependency errors

**Solution:**
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

#### Problem: Node version mismatch

**Solution:**
```bash
# Check Node version
node --version

# Use nvm to switch versions
nvm use 20

# Or install the correct version
nvm install 20
```

---

### Development Server Won't Start

#### Problem: Port already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using the port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

#### Problem: Convex connection fails

**Error:**
```
Error: Failed to connect to Convex
```

**Solution:**
1. Check that Convex dev server is running:
   ```bash
   cd packages/convex
   npx convex dev
   ```

2. Verify environment variables:
   ```bash
   # Check .env.local
   CONVEX_DEPLOYMENT=dev:your-deployment
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

3. Check Convex dashboard for deployment status

---

### Hot Reload Not Working

#### Problem: Changes not reflected in browser

**Solution:**
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

2. Check for syntax errors in changed files

3. Restart the development server

4. Clear browser cache (Ctrl+Shift+R)

---

### TypeScript Errors

#### Problem: Type errors in IDE but build succeeds

**Solution:**
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or rebuild types
pnpm typecheck
```

#### Problem: Missing types for packages

**Solution:**
```bash
# Install type definitions
pnpm add -D @types/package-name

# Or check if types are included in the package
```

---

## Build Issues

### Build Fails

#### Problem: Out of memory during build

**Error:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Or add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' turbo build"
```

#### Problem: Module not found errors

**Solution:**
1. Check import paths are correct
2. Ensure package is listed in dependencies
3. Run `pnpm install` to ensure all packages are installed
4. Check `tsconfig.json` path aliases

---

### Turbo Cache Issues

#### Problem: Stale cache causing issues

**Solution:**
```bash
# Clear Turbo cache
pnpm turbo clean

# Or force rebuild
pnpm build --force
```

---

## Authentication Issues

### Login Fails

#### Problem: OAuth redirect fails

**Error:**
```
Error: Invalid redirect_uri
```

**Solution:**
1. Check OAuth provider settings:
   - Google Cloud Console
   - GitHub Developer Settings

2. Verify redirect URIs match:
   ```
   Development: http://localhost:3000/api/auth/callback/google
   Production: https://createconomy.com/api/auth/callback/google
   ```

3. Check `AUTH_SECRET` is set correctly

---

### Session Issues

#### Problem: User logged out unexpectedly

**Possible Causes:**
1. Session expired
2. Cookie domain mismatch
3. CSRF token invalid

**Solution:**
1. Check session configuration:
   ```typescript
   // Verify cookie domain
   domain: process.env.NODE_ENV === "production" 
     ? ".createconomy.com" 
     : "localhost"
   ```

2. Clear cookies and re-login

3. Check for CSRF token issues in network tab

---

### Cross-Domain Auth Issues

#### Problem: Not authenticated on subdomains

**Solution:**
1. Verify cookie domain is set to parent domain:
   ```
   domain: .createconomy.com
   ```

2. Check `SameSite` cookie attribute:
   ```
   sameSite: "lax"
   ```

3. Ensure all apps use the same `AUTH_SECRET`

---

## Database Issues

### Convex Sync Issues

#### Problem: Data not updating in real-time

**Solution:**
1. Check WebSocket connection in browser DevTools
2. Verify Convex subscription is active:
   ```typescript
   const data = useQuery(api.functions.getData);
   console.log("Query status:", data === undefined ? "loading" : "loaded");
   ```

3. Check Convex dashboard for function errors

---

### Query Errors

#### Problem: Query returns undefined

**Possible Causes:**
1. Query is still loading
2. Data doesn't exist
3. Authorization failure

**Solution:**
```typescript
const data = useQuery(api.functions.getData, { id });

// Handle loading state
if (data === undefined) {
  return <Loading />;
}

// Handle not found
if (data === null) {
  return <NotFound />;
}
```

---

### Migration Issues

#### Problem: Schema changes not applied

**Solution:**
```bash
# Push schema changes
cd packages/convex
npx convex dev --once

# For production
npx convex deploy
```

---

## Payment Issues

### Stripe Integration

#### Problem: Payment fails silently

**Solution:**
1. Check Stripe Dashboard for error details
2. Verify API keys are correct:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. Check webhook logs in Stripe Dashboard

---

### Webhook Issues

#### Problem: Webhooks not received

**Solution:**
1. Verify webhook endpoint is accessible:
   ```bash
   curl -X POST https://your-domain.com/api/webhooks/stripe
   ```

2. Check webhook signing secret:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. For local development, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

### Connect Issues

#### Problem: Seller payouts failing

**Solution:**
1. Verify seller's Stripe Connect account is active
2. Check account capabilities in Stripe Dashboard
3. Verify payout schedule and minimum amounts

---

## Deployment Issues

### Vercel Deployment

#### Problem: Build fails on Vercel

**Solution:**
1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Check Node.js version matches local:
   ```json
   // package.json
   "engines": {
     "node": ">=20.0.0"
   }
   ```

---

### Environment Variables

#### Problem: Environment variables not available

**Solution:**
1. For client-side variables, prefix with `NEXT_PUBLIC_`:
   ```
   NEXT_PUBLIC_CONVEX_URL=...
   ```

2. Verify variables are set in Vercel Dashboard

3. Redeploy after adding new variables

---

### Domain Issues

#### Problem: Custom domain not working

**Solution:**
1. Verify DNS records are correct
2. Check SSL certificate status
3. Wait for DNS propagation (up to 48 hours)

---

## Debug Mode

### Enable Debug Logging

```typescript
// Add to .env.local
DEBUG=true
LOG_LEVEL=debug
```

### React DevTools

1. Install React DevTools browser extension
2. Open DevTools → Components tab
3. Inspect component props and state

### Convex DevTools

1. Open browser DevTools
2. Go to Network tab
3. Filter by "convex" to see all Convex requests

### Network Debugging

```typescript
// Log all API requests
if (process.env.NODE_ENV === "development") {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log("Fetch:", args[0]);
    const response = await originalFetch(...args);
    console.log("Response:", response.status);
    return response;
  };
}
```

---

## Log Locations

### Development Logs

| Log Type | Location |
|----------|----------|
| Next.js Server | Terminal running `pnpm dev` |
| Convex Functions | Convex Dashboard → Logs |
| Browser Console | DevTools → Console |
| Network Requests | DevTools → Network |

### Production Logs

| Log Type | Location |
|----------|----------|
| Vercel Functions | Vercel Dashboard → Logs |
| Convex Functions | Convex Dashboard → Logs |
| Error Tracking | Sentry Dashboard (if configured) |

### Accessing Convex Logs

```bash
# View recent logs
npx convex logs

# Stream logs in real-time
npx convex logs --follow

# Filter by function
npx convex logs --function products.list
```

---

## Getting Help

### Self-Service Resources

1. **Documentation**: Check the [docs](./README.md) folder
2. **GitHub Issues**: Search [existing issues](https://github.com/createconomy/createconomy/issues)
3. **Discussions**: Browse [GitHub Discussions](https://github.com/createconomy/createconomy/discussions)

### Community Support

- **Discord**: Join our [Discord server](https://discord.gg/createconomy)
- **Stack Overflow**: Tag questions with `createconomy`

### Reporting Bugs

When reporting a bug, include:

1. **Environment**: OS, Node version, browser
2. **Steps to reproduce**: Detailed steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Error messages**: Full error text and stack trace
6. **Screenshots**: If applicable

### Bug Report Template

```markdown
## Bug Description
A clear description of the bug.

## Environment
- OS: Windows 11 / macOS 14 / Ubuntu 22.04
- Node: 20.11.0
- pnpm: 9.15.4
- Browser: Chrome 121

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Error Messages
```
Paste error messages here
```

## Screenshots
If applicable, add screenshots.

## Additional Context
Any other relevant information.
```

### Contact

- **General Support**: support@createconomy.com
- **Security Issues**: security@createconomy.com
- **Business Inquiries**: business@createconomy.com

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm dev --filter=marketplace  # Start specific app

# Building
pnpm build                  # Build all
pnpm build --force          # Force rebuild

# Testing
pnpm test                   # Run tests
pnpm test:coverage          # With coverage

# Linting
pnpm lint                   # Run linter
pnpm format                 # Format code

# Convex
npx convex dev              # Start Convex dev
npx convex deploy           # Deploy to production
npx convex logs             # View logs

# Cleanup
pnpm clean                  # Clean all
rm -rf .next node_modules   # Manual cleanup
```

### Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
