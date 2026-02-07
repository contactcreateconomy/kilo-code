# Phase 0: Cleanup - Remove Unused Docker Files

## Rationale

The project deploys to Vercel and develops locally. Docker files are unused infrastructure overhead that add confusion and maintenance burden.

## Tasks

- [ ] Delete `docker-compose.yml` from project root
- [ ] Delete `Dockerfile.dev` from project root
- [ ] Remove any Docker references from `README.md` if present
- [ ] Verify `.gitignore` does not have Docker-specific entries that are now unnecessary

## Files to Delete

| File | Reason |
|------|--------|
| `docker-compose.yml` | Unused - deploying to Vercel, developing locally |
| `Dockerfile.dev` | Unused - no Docker-based development workflow |

## Additional Cleanup Notes

The `docker-compose.yml` references `node:20-alpine` while `package.json` requires Node.js 24+. This version mismatch confirms Docker was not actively maintained.

The `Dockerfile.dev` also pins `pnpm@9` while `package.json` requires `pnpm>=10.0.0` - another stale reference.
