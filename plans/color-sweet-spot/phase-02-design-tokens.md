# Phase 2: Add Vote Tokens + Update Design System

> Add `--upvote` and `--downvote` CSS custom properties to the design system and update the Tailwind theme mapping.

## Prerequisites

- None (can run in parallel with Phase 1)

## Changes

### Step 1: Update `packages/ui/src/globals.css`

Add vote tokens to the `:root` block (light mode):

```css
/* Vote Colors */
--upvote: oklch(0.705 0.213 47);         /* Orange ~#F97316 */
--upvote-foreground: oklch(1 0 0);
--downvote: oklch(0.585 0.233 264);       /* = Primary indigo */
--downvote-foreground: oklch(1 0 0);
```

Add vote tokens to the `.dark` block:

```css
/* Vote Colors — Dark Mode */
--upvote: oklch(0.705 0.213 47);
--upvote-foreground: oklch(1 0 0);
--downvote: oklch(0.488 0.243 264.376);
--downvote-foreground: oklch(0.985 0 0);
```

### Step 2: Update `@theme inline` mapping in `packages/ui/src/globals.css`

```css
--color-upvote: var(--upvote);
--color-upvote-foreground: var(--upvote-foreground);
--color-downvote: var(--downvote);
--color-downvote-foreground: var(--downvote-foreground);
```

### Step 3: Update `packages/config/tailwind.config.ts`

Add to `theme.extend.colors`:

```typescript
upvote: {
  DEFAULT: "var(--upvote)",
  foreground: "var(--upvote-foreground)",
},
downvote: {
  DEFAULT: "var(--downvote)",
  foreground: "var(--downvote-foreground)",
},
```

### Step 4: Update `apps/forum/src/app/globals.css`

The forum app also duplicates the CSS variables. Add the same vote tokens to both `:root` and `.dark` blocks in this file.

**Note:** Ideally the forum app should NOT duplicate the base variables from `@createconomy/ui/globals.css`. That cleanup is a separate concern but worth noting.

## Token Color Map Summary

After this phase, the complete token system is:

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--primary` | Indigo 585 | Indigo 585 | Brand, CTAs, links |
| `--destructive` | Red 577 | Red 396 | Errors, bans, delete |
| `--success` | Green 723 | Green 627 | Approve, active, positive |
| `--warning` | Yellow 795 | Yellow 750 | Pending, caution |
| `--info` | = Primary | = Primary | Informational |
| `--upvote` | Orange 705 | Orange 705 | Upvote actions |
| `--downvote` | = Primary | = Primary (dark) | Downvote actions |

## Acceptance Criteria

- [ ] Vote tokens added to `packages/ui/src/globals.css` (light + dark)
- [ ] Theme mapping updated in `@theme inline` block
- [ ] Tailwind config updated with `upvote`/`downvote` colors
- [ ] Forum app `globals.css` updated (if keeping duplicated vars)
- [ ] `pnpm typecheck` passes
- [ ] Tailwind classes `text-upvote`, `bg-upvote`, `text-downvote`, `bg-downvote` work correctly
