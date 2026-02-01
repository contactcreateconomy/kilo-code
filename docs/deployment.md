# Deployment Guide

This guide covers deploying the Createconomy platform to Vercel.

## Overview

The Createconomy platform consists of four Next.js applications deployed to different domains:

| Application | Domain | Description |
|-------------|--------|-------------|
| Marketplace | createconomy.com | Main marketplace for buyers |
| Forum | discuss.createconomy.com | Community discussion forum |
| Admin | console.createconomy.com | Admin dashboard |
| Seller | seller.createconomy.com | Seller portal |

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- [pnpm](https://pnpm.io/) v9 or later
- [Vercel CLI](https://vercel.com/cli) installed globally
- A Vercel account with team access (recommended)
- GitHub repository connected to Vercel

## Initial Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Run Setup Script

```bash
chmod +x scripts/setup-vercel.sh
./scripts/setup-vercel.sh
```

This script will:
- Link each app to a Vercel project
- Guide you through environment variable setup
- Provide domain configuration instructions

## Vercel Project Configuration

### Creating Projects

Each app needs its own Vercel project. Create them with these settings:

#### Marketplace Project
- **Name**: `createconomy-marketplace`
- **Framework**: Next.js
- **Root Directory**: `apps/marketplace`
- **Build Command**: `cd ../.. && pnpm turbo build --filter=@createconomy/marketplace`
- **Install Command**: `cd ../.. && pnpm install`

#### Forum Project
- **Name**: `createconomy-forum`
- **Framework**: Next.js
- **Root Directory**: `apps/forum`
- **Build Command**: `cd ../.. && pnpm turbo build --filter=@createconomy/forum`
- **Install Command**: `cd ../.. && pnpm install`

#### Admin Project
- **Name**: `createconomy-admin`
- **Framework**: Next.js
- **Root Directory**: `apps/admin`
- **Build Command**: `cd ../.. && pnpm turbo build --filter=@createconomy/admin`
- **Install Command**: `cd ../.. && pnpm install`

#### Seller Project
- **Name**: `createconomy-seller`
- **Framework**: Next.js
- **Root Directory**: `apps/seller`
- **Build Command**: `cd ../.. && pnpm turbo build --filter=@createconomy/seller`
- **Install Command**: `cd ../.. && pnpm install`

## Environment Variables

### Required Variables (All Apps)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `AUTH_SECRET` | Authentication secret key |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Auth cookie domain (`.createconomy.com`) |

### Marketplace & Seller Apps

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_CONNECT_CLIENT_ID` | Stripe Connect client ID |

### Admin App

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (for refunds) |
| `ADMIN_ALLOWED_EMAILS` | Comma-separated admin emails |

### Setting Environment Variables

Via Vercel CLI:
```bash
cd apps/marketplace
vercel env add STRIPE_SECRET_KEY
```

Via Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add each variable for Production, Preview, and Development

## Domain Configuration

### 1. Add Custom Domains

For each project in Vercel Dashboard:
1. Go to Project Settings > Domains
2. Add the custom domain
3. Follow DNS configuration instructions

### 2. DNS Records

Configure these DNS records at your domain registrar:

```
# A Records (for apex domain)
createconomy.com → 76.76.21.21

# CNAME Records (for subdomains)
discuss.createconomy.com → cname.vercel-dns.com
console.createconomy.com → cname.vercel-dns.com
seller.createconomy.com → cname.vercel-dns.com
```

### 3. SSL Certificates

Vercel automatically provisions SSL certificates for all domains.

## Deployment

### Manual Deployment

Deploy all apps to preview:
```bash
./scripts/deploy.sh preview
```

Deploy all apps to production:
```bash
./scripts/deploy.sh production
```

Deploy a single app:
```bash
cd apps/marketplace
vercel --prod
```

### Automatic Deployment (CI/CD)

Deployments are automated via GitHub Actions:

- **Push to `main`**: Deploys to production
- **Pull Request**: Deploys preview environments

### GitHub Actions Secrets

Configure these secrets in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_MARKETPLACE_PROJECT_ID` | Marketplace project ID |
| `VERCEL_FORUM_PROJECT_ID` | Forum project ID |
| `VERCEL_ADMIN_PROJECT_ID` | Admin project ID |
| `VERCEL_SELLER_PROJECT_ID` | Seller project ID |
| `TURBO_TOKEN` | Turborepo remote cache token |

### GitHub Actions Variables

| Variable | Description |
|----------|-------------|
| `TURBO_TEAM` | Turborepo team name |

## Remote Caching

Enable Turborepo remote caching for faster builds:

### 1. Login to Turborepo

```bash
npx turbo login
```

### 2. Link Repository

```bash
npx turbo link
```

### 3. Verify Caching

```bash
pnpm build
# Second build should show cache hits
pnpm build
```

## Monitoring & Logs

### Vercel Dashboard

- View deployment logs
- Monitor function invocations
- Check analytics

### Runtime Logs

```bash
vercel logs [deployment-url]
```

### Real-time Logs

```bash
vercel logs [deployment-url] --follow
```

## Rollback

### Via CLI

```bash
vercel rollback [deployment-url]
```

### Via Dashboard

1. Go to Deployments
2. Find the previous working deployment
3. Click "..." > "Promote to Production"

## Troubleshooting

### Build Failures

1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Run build locally: `pnpm build`

### Environment Variable Issues

```bash
# List all env vars
vercel env ls

# Pull env vars locally
vercel env pull
```

### Domain Issues

1. Verify DNS propagation: `dig createconomy.com`
2. Check SSL certificate status in Vercel Dashboard
3. Ensure domain is verified

### Cache Issues

Clear Turborepo cache:
```bash
pnpm clean
rm -rf node_modules/.cache
```

## Security Considerations

1. **Never commit secrets** - Use environment variables
2. **Rotate secrets regularly** - Update Stripe keys, auth secrets
3. **Review access** - Audit Vercel team members
4. **Monitor deployments** - Set up alerts for failed deployments

## Cost Optimization

1. **Use remote caching** - Reduces build times and costs
2. **Optimize images** - Use Next.js Image component
3. **Monitor usage** - Check Vercel usage dashboard
4. **Set spending limits** - Configure in Vercel settings
