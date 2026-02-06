# Deployment Guide

This document describes the Vercel deployment setup for the Createconomy monorepo using **Vercel's native GitHub integration**.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  feature/xyz ─────┐                                                  │
│                   │  Push / PR                                       │
│  bugfix/abc ──────┼─────────────────►  Preview Environment           │
│                   │                    (Vercel auto-deploys)         │
│  dev/something ───┘                                                  │
│                                                                      │
│         │                                                            │
│         │ Merge PR (after CI passes)                                 │
│         ▼                                                            │
│                                                                      │
│       main ─────────────────────────►  Production Environment        │
│                                        (Vercel auto-deploys)         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## How It Works

### Vercel Native Integration (Handles Deployments)

Vercel's GitHub integration automatically:
- **Preview**: Deploys every push to non-main branches
- **Production**: Deploys every push to `main` branch
- **PR Comments**: Posts preview URLs on pull requests
- **Build & Deploy**: Handles the entire build process

### GitHub Actions (CI Only)

A minimal [`.github/workflows/ci.yml`](.github/workflows/ci.yml) provides:
- **Type checking** as a required status check before merge
- Only runs on PRs targeting `main` with app/package changes

## Environments

| Environment | Branch | Trigger | Managed By |
|-------------|--------|---------|------------|
| **Preview** | Any non-main branch | Push / PR | Vercel |
| **Production** | `main` | Merge to main | Vercel |

### Production URLs

| App | URL |
|-----|-----|
| Marketplace | https://createconomy.com |
| Forum | https://discuss.createconomy.com |
| Admin | https://console.createconomy.com |
| Seller | https://seller.createconomy.com |

## Vercel Project Configuration

Each app should be configured in Vercel dashboard:

### 1. Required Environment Variable (CRITICAL)

**For pnpm 10+ support**, add this environment variable to **each project** in Vercel:

Navigate to **Project Settings → Environment Variables** and add:

| Name | Value | Environments |
|------|-------|--------------|
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Production, Preview, Development |

This enables corepack which reads the `packageManager` field from `package.json` to use the correct pnpm version (10.28.2).

### 2. Git Integration Settings

Navigate to **Project Settings → Git** for each app:

| Setting | Value |
|---------|-------|
| **Production Branch** | `main` |
| **Automatically expose System Environment Variables** | ✅ |

### 3. Ignored Build Step (Monorepo Optimization)

To skip builds when only unrelated apps change, add this in **Project Settings → Git → Ignored Build Step**:

For **Marketplace**:
```bash
git diff HEAD^ HEAD --quiet apps/marketplace packages
```

For **Forum**:
```bash
git diff HEAD^ HEAD --quiet apps/forum packages
```

For **Admin**:
```bash
git diff HEAD^ HEAD --quiet apps/admin packages
```

For **Seller**:
```bash
git diff HEAD^ HEAD --quiet apps/seller packages
```

This tells Vercel to skip the build if no relevant files changed.

### 4. Root Directory

| App | Root Directory |
|-----|----------------|
| Marketplace | `apps/marketplace` |
| Forum | `apps/forum` |
| Admin | `apps/admin` |
| Seller | `apps/seller` |

## Branch Protection Rules

Configure in **GitHub Settings → Branches → Add branch protection rule** for `main`:

| Setting | Value |
|---------|-------|
| **Branch name pattern** | `main` |
| **Require a pull request before merging** | ✅ Enabled |
| **Require approvals** | 1 (adjust for team size) |
| **Dismiss stale pull request approvals** | ✅ Enabled |
| **Require status checks to pass** | ✅ Enabled |
| **Required status checks** | `Type Check`, `Vercel` |
| **Require branches to be up to date** | ✅ Enabled |
| **Allow force pushes** | ❌ Disabled |
| **Allow deletions** | ❌ Disabled |

## Workflow

### Developer Flow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# → Vercel automatically creates preview deployment
# → GitHub Actions runs type check

# 3. Create Pull Request
# → Preview URL appears in PR comments
# → CI must pass before merge

# 4. Merge to main
# → Vercel automatically deploys to production
```

### What Triggers Deployments

| Action | Preview Deploy | Production Deploy | CI Check |
|--------|---------------|-------------------|----------|
| Push to feature branch | ✅ | ❌ | ❌ |
| Open PR to main | ✅ | ❌ | ✅ |
| Update PR | ✅ | ❌ | ✅ |
| Merge PR to main | ❌ | ✅ | ❌ |

## Cost Optimization

| Optimization | Implementation |
|--------------|----------------|
| **Skip unrelated builds** | Vercel "Ignored Build Step" for each app |
| **Minimal CI** | Only type check, Vercel handles builds |
| **Path filtering** | CI only runs on app/package changes |
| **Concurrency** | Cancel in-progress CI runs |

## Troubleshooting

### Preview not deploying

1. Check Vercel dashboard → Deployments for errors
2. Verify the app's root directory is correct
3. Check if "Ignored Build Step" incorrectly skipped the build

### Type check failing but Vercel deploying

Vercel deploys are independent of GitHub Actions. To block deployments on CI failure:
1. Enable branch protection requiring status checks
2. Require PRs before merging to main

### Production not updating after merge

1. Check Vercel dashboard → Deployments
2. Verify `main` is set as production branch
3. Check if "Ignored Build Step" skipped the build

## Local Development

```bash
# Install dependencies
pnpm install

# Run type check locally
pnpm typecheck

# Run specific app
pnpm --filter marketplace dev
pnpm --filter forum dev
pnpm --filter admin dev
pnpm --filter seller dev
```
