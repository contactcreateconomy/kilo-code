# Comprehensive Dependency Migration Plan

## Executive Summary

This document provides a complete audit of all dependencies across the 4 applications and 3 shared packages in the Createconomy monorepo, comparing current versions against the latest stable releases, and outlining a prioritized migration roadmap.

---

## 1. Current State Analysis

### Monorepo Structure

```
createconomy/
├── apps/
│   ├── admin/        (Port 3002) - Admin dashboard
│   ├── forum/        (Port 3001) - Community forum
│   ├── marketplace/  (Port 3000) - Main marketplace
│   └── seller/       (Port 3003) - Seller portal
├── packages/
│   ├── config/       - Shared configurations (ESLint, TypeScript, Tailwind, Vitest)
│   ├── convex/       - Convex backend functions and schema
│   └── ui/           - Shared UI components
```

### Runtime Environment

| Tool | Current | Latest | Status |
|------|---------|--------|--------|
| Node.js | 20.11.0 (specified) / 24.12.0 (actual) | 24.x LTS | ⚠️ Mismatch - .nvmrc says 20.11.0 but running 24.12.0 |
| pnpm | 9.15.4 | 10.28.2 | ⚠️ Major update available |

---

## 2. Version Comparison Matrix

### Root Package Dependencies

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| eslint | ^9.19.0 | 9.39.2 | Minor | 🟡 Medium |
| prettier | ^3.4.2 | 3.8.1 | Minor | 🟢 Low |
| rimraf | ^6.0.1 | 6.1.2 | Patch | 🟢 Low |
| turbo | ^2.4.2 | 2.8.3 | Minor | 🟡 Medium |
| typescript | ^5.7.3 | 5.9.3 | Minor | 🟡 Medium |

### Core Framework Dependencies (All Apps)

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| next | ^15.1.6 | 16.1.6 | **MAJOR** | 🔴 High |
| react | ^19.0.0 | 19.2.4 | Minor | 🟡 Medium |
| react-dom | ^19.0.0 | 19.2.4 | Minor | 🟡 Medium |
| convex | ^1.18.0 (apps) / ^1.31.7 (pkg) | 1.31.7 | Minor | 🟡 Medium |
| @convex-dev/auth | ^0.0.80 (apps) / ^0.0.90 (pkg) | 0.0.90 | Patch | 🟡 Medium |
| typescript | ^5.7.3 | 5.9.3 | Minor | 🟡 Medium |

### Styling Dependencies

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| tailwindcss | ^4.0.0 | 4.1.18 | Minor | 🟡 Medium |
| @tailwindcss/postcss | ^4.0.0 | 4.1.18 | Minor | 🟡 Medium |
| postcss | ^8.5.1 | 8.5.6 | Patch | 🟢 Low |

### UI Component Dependencies (packages/ui)

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| @radix-ui/react-avatar | ^1.1.11 | 1.1.11 | ✅ Current | 🟢 None |
| @radix-ui/react-dropdown-menu | ^2.1.16 | 2.1.16 | ✅ Current | 🟢 None |
| @radix-ui/react-label | ^2.1.2 | 2.1.8 | Minor | 🟢 Low |
| @radix-ui/react-separator | ^1.1.8 | 1.1.8 | ✅ Current | 🟢 None |
| @radix-ui/react-slot | ^1.1.2 | 1.2.4 | Minor | 🟢 Low |
| class-variance-authority | ^0.7.1 | 0.7.1 | ✅ Current | 🟢 None |
| clsx | ^2.1.1 | 2.1.1 | ✅ Current | 🟢 None |
| tailwind-merge | ^2.6.0 | 3.4.0 | **MAJOR** | 🟡 Medium |
| lucide-react | ^0.474.0 (ui) / ^0.469.0 (forum) | 0.563.0 | Minor | 🟢 Low |

### Payment & Auth Dependencies

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| stripe | ^17.5.0 | 20.3.0 | **MAJOR** | 🔴 High |
| @stripe/stripe-js | ^8.7.0 | 8.7.0 | ✅ Current | 🟢 None |
| @clerk/nextjs | ^6.10.3 | 6.37.2 | Minor | 🟡 Medium |
| @auth/core | ^0.37.4 | 0.34.3 | ⚠️ Downgrade? | 🟡 Review |

### Animation & Carousel Dependencies (apps/forum)

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| framer-motion | ^12.29.2 | 12.31.0 | Patch | 🟢 Low |
| embla-carousel-react | ^8.6.0 | 8.6.0 | ✅ Current | 🟢 None |
| embla-carousel-autoplay | ^8.6.0 | 8.6.0 | ✅ Current | 🟢 None |

### State Management (apps/marketplace)

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| zustand | ^5.0.0 | 5.0.11 | Patch | 🟢 Low |

### Charts (apps/admin, apps/seller)

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| recharts | ^2.15.0 | 3.7.0 | **MAJOR** | 🟡 Medium |

### Testing Dependencies

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| vitest | ^3.0.4 | 4.0.18 | **MAJOR** | 🟡 Medium |
| @testing-library/react | ^16.2.0 | 16.3.2 | Patch | 🟢 Low |
| @testing-library/jest-dom | ^6.6.3 | 6.9.1 | Patch | 🟢 Low |
| @testing-library/user-event | ^14.5.2 | 14.6.1 | Patch | 🟢 Low |
| @vitejs/plugin-react | ^4.3.4 | 5.1.3 | **MAJOR** | 🟡 Medium |
| jsdom | ^26.0.0 | 28.0.0 | **MAJOR** | 🟡 Medium |
| vite-tsconfig-paths | ^5.1.4 | 6.0.5 | **MAJOR** | 🟡 Medium |

### ESLint & Config Dependencies (packages/config)

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| @eslint/js | ^9.19.0 | 9.39.2 | Minor | 🟡 Medium |
| eslint | ^9.19.0 | 9.39.2 | Minor | 🟡 Medium |
| eslint-config-next | ^15.1.6 | 16.1.6 | **MAJOR** | 🔴 High |
| eslint-config-prettier | ^10.0.1 | 10.1.8 | Patch | 🟢 Low |
| eslint-plugin-react | ^7.37.4 | 7.37.5 | Patch | 🟢 Low |
| eslint-plugin-react-hooks | ^5.1.0 | 7.0.1 | **MAJOR** | 🔴 High |
| typescript-eslint | ^8.22.0 | 8.54.0 | Minor | 🟡 Medium |

### Type Definitions

| Package | Current | Latest | Gap | Priority |
|---------|---------|--------|-----|----------|
| @types/node | ^22.12.0 / ^22.0.0 | 25.2.0 | **MAJOR** | 🟡 Medium |
| @types/react | ^19.0.8 | 19.2.10 | Minor | 🟢 Low |
| @types/react-dom | ^19.0.3 | 19.2.3 | Minor | 🟢 Low |

---

## 3. Compatibility Assessment

### Critical Compatibility Concerns

#### 1. Next.js 15 → 16 Migration
- **Breaking Changes**: 
  - App Router changes
  - Middleware API updates
  - Image component changes
  - New caching behavior
- **Required Actions**:
  - Review all `next.config.ts` files
  - Update middleware implementations
  - Test all dynamic routes
  - Verify image optimization

#### 2. React 19.0 → 19.2 Migration
- **Compatibility**: Generally backward compatible
- **New Features**: Improved concurrent rendering, better error boundaries
- **Required Actions**: Test all components for hydration issues

#### 3. Stripe 17 → 20 Migration
- **Breaking Changes**:
  - API version changes
  - Webhook signature verification updates
  - Payment Intent API changes
- **Required Actions**:
  - Update all Stripe API calls
  - Review webhook handlers
  - Test payment flows thoroughly

#### 4. Vitest 3 → 4 Migration
- **Breaking Changes**:
  - Configuration format changes
  - Reporter API changes
- **Required Actions**:
  - Update `vitest.config.ts`
  - Review test utilities

#### 5. eslint-plugin-react-hooks 5 → 7 Migration
- **Breaking Changes**:
  - New rules enabled by default
  - Stricter hook dependency checking
- **Required Actions**:
  - Run linting and fix all new errors
  - May require code refactoring

### Version Alignment Issues

| Issue | Current State | Recommended Fix |
|-------|---------------|-----------------|
| convex version mismatch | Apps: ^1.18.0, Package: ^1.31.7 | Align all to ^1.31.7 |
| @convex-dev/auth mismatch | Apps: ^0.0.80, Package: ^0.0.90 | Align all to ^0.0.90 |
| lucide-react mismatch | UI: ^0.474.0, Forum: ^0.469.0 | Align all to ^0.563.0 |
| @types/node mismatch | Some: ^22.12.0, Some: ^22.0.0 | Align all to ^25.2.0 |
| Node.js version mismatch | .nvmrc: 20.11.0, Actual: 24.12.0 | Update .nvmrc to 24.x |

---

## 4. Dependency Audit

### Deprecated Dependencies
- None identified

### Security Vulnerabilities
- Run `pnpm audit` after updates to verify

### Peer Dependency Conflicts

| Package | Peer Requirement | Current | Status |
|---------|------------------|---------|--------|
| @testing-library/react | react ^18.0.0 \|\| ^19.0.0 | ^19.0.0 | ✅ OK |
| recharts | react ^16.0.0 \|\| ^17.0.0 \|\| ^18.0.0 | ^19.0.0 | ⚠️ May need update |
| @clerk/nextjs | next ^13.5.0 \|\| ^14.0.0 \|\| ^15.0.0 | ^15.1.6 | ⚠️ Check for Next 16 support |

### Duplicate Dependencies
- `lucide-react` appears in both `packages/ui` and `apps/forum` - should be hoisted to UI package only

---

## 5. Migration Roadmap

### Phase 1: Critical Updates (Week 1)

#### Items to Modify

1. **Align internal package versions**
   ```json
   // All apps - update convex and auth versions
   "convex": "^1.31.7",
   "@convex-dev/auth": "^0.0.90"
   ```

2. **Update Node.js version files**
   ```
   // .nvmrc and .node-version
   24.12.0
   ```

3. **Update pnpm version**
   ```json
   // package.json
   "packageManager": "pnpm@10.28.2"
   ```

#### Items to Remove
- `lucide-react` from `apps/forum/package.json` (use from `@createconomy/ui`)

### Phase 2: Framework Updates (Week 2)

#### Items to Modify

1. **Update Next.js ecosystem**
   ```json
   "next": "^16.1.6",
   "eslint-config-next": "^16.1.6"
   ```

2. **Update React ecosystem**
   ```json
   "react": "^19.2.4",
   "react-dom": "^19.2.4",
   "@types/react": "^19.2.10",
   "@types/react-dom": "^19.2.3"
   ```

3. **Update TypeScript**
   ```json
   "typescript": "^5.9.3",
   "@types/node": "^25.2.0"
   ```

#### Breaking Changes to Address
- Review all `next.config.ts` files for deprecated options
- Update any deprecated Next.js APIs
- Test all routes and middleware

### Phase 3: Tooling Updates (Week 3)

#### Items to Modify

1. **Update build tools**
   ```json
   "turbo": "^2.8.3",
   "eslint": "^9.39.2",
   "@eslint/js": "^9.39.2",
   "prettier": "^3.8.1"
   ```

2. **Update ESLint plugins**
   ```json
   "eslint-plugin-react-hooks": "^7.0.1",
   "typescript-eslint": "^8.54.0",
   "eslint-config-prettier": "^10.1.8",
   "eslint-plugin-react": "^7.37.5"
   ```

3. **Update styling tools**
   ```json
   "tailwindcss": "^4.1.18",
   "@tailwindcss/postcss": "^4.1.18",
   "postcss": "^8.5.6"
   ```

#### Breaking Changes to Address
- Run `pnpm lint` and fix all new ESLint errors
- Review Tailwind CSS v4 migration guide

### Phase 4: Testing Infrastructure (Week 4)

#### Items to Modify

1. **Update testing tools**
   ```json
   "vitest": "^4.0.18",
   "@vitejs/plugin-react": "^5.1.3",
   "jsdom": "^28.0.0",
   "vite-tsconfig-paths": "^6.0.5"
   ```

2. **Update testing libraries**
   ```json
   "@testing-library/react": "^16.3.2",
   "@testing-library/jest-dom": "^6.9.1",
   "@testing-library/user-event": "^14.6.1"
   ```

#### Breaking Changes to Address
- Update `vitest.config.ts` for Vitest 4
- Review test utilities for API changes

### Phase 5: Third-Party Services (Week 5)

#### Items to Modify

1. **Update Stripe**
   ```json
   "stripe": "^20.3.0"
   ```

2. **Update Clerk**
   ```json
   "@clerk/nextjs": "^6.37.2"
   ```

3. **Update Auth.js**
   ```json
   "@auth/core": "^0.34.3"
   ```

#### Breaking Changes to Address
- Review Stripe API changelog for breaking changes
- Update webhook handlers
- Test all payment flows
- Review Clerk migration guide

### Phase 6: UI & Utility Updates (Week 6)

#### Items to Modify

1. **Update UI utilities**
   ```json
   "tailwind-merge": "^3.4.0",
   "@radix-ui/react-label": "^2.1.8",
   "@radix-ui/react-slot": "^1.2.4"
   ```

2. **Update icons**
   ```json
   "lucide-react": "^0.563.0"
   ```

3. **Update charts**
   ```json
   "recharts": "^3.7.0"
   ```

4. **Update other utilities**
   ```json
   "framer-motion": "^12.31.0",
   "zustand": "^5.0.11",
   "rimraf": "^6.1.2"
   ```

#### Breaking Changes to Address
- Review recharts v3 migration guide
- Update chart components
- Review tailwind-merge v3 changes

---

## 6. Best Practices Implementation

### Recommended Changes

1. **Centralize shared dependencies in workspace root**
   - Move common devDependencies to root package.json
   - Use `pnpm.overrides` for version alignment

2. **Add `.npmrc` improvements**
   ```ini
   auto-install-peers=true
   strict-peer-dependencies=false
   shamefully-hoist=true
   resolution-mode=highest
   ```

3. **Add Renovate/Dependabot configuration**
   - Automate dependency updates
   - Group related packages

4. **Implement version pinning strategy**
   - Pin major versions for stability
   - Allow minor/patch updates

5. **Add pre-commit hooks**
   - Run type checking
   - Run linting
   - Run tests

---

## 7. Validation Strategy

### Pre-Migration Checklist

- [ ] Create backup branch
- [ ] Document current working state
- [ ] Run full test suite
- [ ] Verify all apps start correctly
- [ ] Check production builds

### Per-Phase Validation

1. **After each phase:**
   - [ ] Run `pnpm install`
   - [ ] Run `pnpm typecheck`
   - [ ] Run `pnpm lint`
   - [ ] Run `pnpm test`
   - [ ] Run `pnpm build`
   - [ ] Start each app and verify functionality

2. **Integration testing:**
   - [ ] Test cross-app navigation
   - [ ] Test shared component rendering
   - [ ] Test Convex data flow
   - [ ] Test authentication flows
   - [ ] Test payment flows

### Post-Migration Validation

- [ ] Full regression testing
- [ ] Performance benchmarking
- [ ] Security audit (`pnpm audit`)
- [ ] Bundle size analysis
- [ ] Lighthouse scores
- [ ] E2E testing (if available)

### Rollback Plan

1. Keep backup branch until validation complete
2. Document any manual changes made
3. Have rollback scripts ready for database migrations
4. Monitor error rates after deployment

---

## 8. Summary

### Total Updates Required

| Category | Count |
|----------|-------|
| Major Updates | 10 |
| Minor Updates | 25 |
| Patch Updates | 15 |
| Already Current | 8 |
| Version Alignments | 5 |

### Estimated Timeline

| Phase | Duration | Risk Level |
|-------|----------|------------|
| Phase 1: Critical | 1 week | Low |
| Phase 2: Framework | 1 week | High |
| Phase 3: Tooling | 1 week | Medium |
| Phase 4: Testing | 1 week | Medium |
| Phase 5: Services | 1 week | High |
| Phase 6: UI | 1 week | Low |

**Total Estimated Time: 6 weeks**

### Risk Assessment

- **High Risk**: Next.js 16, Stripe 20 migrations
- **Medium Risk**: Vitest 4, ESLint plugins, recharts 3
- **Low Risk**: Minor version updates, patch updates

---

## Appendix: Package.json Updates

### Root package.json

```json
{
  "packageManager": "pnpm@10.28.2",
  "devDependencies": {
    "eslint": "^9.39.2",
    "prettier": "^3.8.1",
    "rimraf": "^6.1.2",
    "turbo": "^2.8.3",
    "typescript": "^5.9.3"
  },
  "engines": {
    "node": ">=24.0.0",
    "pnpm": ">=10.0.0"
  }
}
```

### apps/admin/package.json

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "convex": "^1.31.7",
    "@convex-dev/auth": "^0.0.90",
    "@clerk/nextjs": "^6.37.2",
    "recharts": "^3.7.0",
    "stripe": "^20.3.0"
  },
  "devDependencies": {
    "@types/node": "^25.2.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.9.3",
    "tailwindcss": "^4.1.18",
    "@tailwindcss/postcss": "^4.1.18",
    "postcss": "^8.5.6"
  }
}
```

### apps/forum/package.json

```json
{
  "dependencies": {
    "@convex-dev/auth": "^0.0.90",
    "convex": "^1.31.7",
    "embla-carousel-autoplay": "^8.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.31.0",
    "next": "^16.1.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.18",
    "@types/node": "^25.2.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3"
  }
}
```

### apps/marketplace/package.json

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "convex": "^1.31.7",
    "@convex-dev/auth": "^0.0.90",
    "@stripe/stripe-js": "^8.7.0",
    "stripe": "^20.3.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^25.2.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.3",
    "jsdom": "^28.0.0",
    "postcss": "^8.5.6",
    "@tailwindcss/postcss": "^4.1.18",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "vite-tsconfig-paths": "^6.0.5",
    "vitest": "^4.0.18"
  }
}
```

### apps/seller/package.json

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "convex": "^1.31.7",
    "@convex-dev/auth": "^0.0.90",
    "recharts": "^3.7.0",
    "@stripe/stripe-js": "^8.7.0",
    "stripe": "^20.3.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^25.2.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "typescript": "^5.9.3",
    "tailwindcss": "^4.1.18",
    "@tailwindcss/postcss": "^4.1.18",
    "postcss": "^8.5.6"
  }
}
```

### packages/config/package.json

```json
{
  "devDependencies": {
    "@eslint/js": "^9.39.2",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^25.2.0",
    "@vitejs/plugin-react": "^5.1.3",
    "eslint": "^9.39.2",
    "eslint-config-next": "^16.1.6",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^7.0.1",
    "jsdom": "^28.0.0",
    "postcss": "^8.5.6",
    "@tailwindcss/postcss": "^4.1.18",
    "tailwindcss": "^4.1.18",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.54.0",
    "vite-tsconfig-paths": "^6.0.5",
    "vitest": "^4.0.18"
  }
}
```

### packages/convex/package.json

```json
{
  "dependencies": {
    "convex": "^1.31.7",
    "@convex-dev/auth": "^0.0.90",
    "@auth/core": "^0.34.3",
    "stripe": "^20.3.0"
  },
  "devDependencies": {
    "@types/node": "^25.2.0",
    "typescript": "^5.9.3"
  }
}
```

### packages/ui/package.json

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.563.0",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.18"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^25.2.0",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.3",
    "jsdom": "^28.0.0",
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "typescript": "^5.9.3",
    "vite-tsconfig-paths": "^6.0.5",
    "vitest": "^4.0.18"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

*Document generated: February 4, 2026*
*Last updated: February 4, 2026*
