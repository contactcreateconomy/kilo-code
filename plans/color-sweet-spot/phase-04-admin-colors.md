# Phase 4: Replace Hardcoded Colors in Admin App

> Replace all hardcoded Tailwind named colors in `apps/admin/src/` with design tokens.

## Prerequisites

- Phase 2 (design tokens) must be complete

## File-by-File Changes

### 4.1 `apps/admin/src/app/moderation/page.tsx`

**Stat card numbers (lines ~35-57):**
```
BEFORE: text-yellow-600 (pending reports)
AFTER:  text-warning

BEFORE: text-blue-600 (reviewed today)
AFTER:  text-primary

BEFORE: text-green-600 (actions this week)
AFTER:  text-success

BEFORE: text-red-600 (active bans)
AFTER:  text-destructive
```

**Status badges (lines ~89-93):**
```
BEFORE: bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
AFTER:  bg-warning/10 text-warning

BEFORE: bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400
AFTER:  bg-destructive/10 text-destructive
```

### 4.2 `apps/admin/src/app/moderation/reports/page.tsx`

**Status colors map (lines ~11-16):**
```
BEFORE:
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  actioned: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
AFTER:
  pending: 'bg-warning/10 text-warning'
  reviewed: 'bg-primary/10 text-primary'
  actioned: 'bg-success/10 text-success'
  dismissed: 'bg-muted text-muted-foreground'
```

**Reason colors map (lines ~18-28):**
```
BEFORE: 8 different color combinations for report reasons
AFTER:
  spam: 'bg-warning/10 text-warning'
  harassment: 'bg-destructive/10 text-destructive'
  hate_speech: 'bg-destructive/10 text-destructive'
  misinformation: 'bg-primary/10 text-primary'
  nsfw: 'bg-destructive/10 text-destructive'
  off_topic: 'bg-primary/10 text-primary'
  self_harm: 'bg-destructive/10 text-destructive'
  violence: 'bg-destructive/10 text-destructive'
  other: 'bg-muted text-muted-foreground'
```

**Report count badge (line ~147):**
```
BEFORE: bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400
AFTER:  bg-warning/10 text-warning
```

**Author name (line ~257):**
```
BEFORE: text-red-600
AFTER:  text-destructive
```

**Action buttons (lines ~297-312):**
```
BEFORE: border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
AFTER:  border-destructive text-destructive hover:bg-destructive/10

BEFORE: border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20
AFTER:  border-warning text-warning hover:bg-warning/10

BEFORE: bg-red-600 text-white hover:bg-red-700
AFTER:  bg-destructive text-destructive-foreground hover:bg-destructive/90
```

### 4.3 `apps/admin/src/app/moderation/bans/page.tsx`

**Ban count badge (line ~46):**
```
BEFORE: bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400
AFTER:  bg-destructive/10 text-destructive
```

**Ban type badges (lines ~105-107):**
```
BEFORE: bg-red-100 text-red-800 (permanent), bg-yellow-100 text-yellow-800 (temporary)
AFTER:  bg-destructive/10 text-destructive (permanent), bg-warning/10 text-warning (temporary)
```

### 4.4 `apps/admin/src/app/moderation/reviews/page.tsx`

**Star rating colors (line ~104):**
```
BEFORE: text-yellow-500 (filled), text-gray-300 (empty)
AFTER:  text-warning (filled), text-muted-foreground/30 (empty)
```

**Action buttons (lines ~144, 241-244):**
```
BEFORE: bg-green-600 text-white hover:bg-green-700
AFTER:  bg-success text-success-foreground hover:bg-success/90

BEFORE: border-red-500 text-red-500 hover:bg-red-50
AFTER:  border-destructive text-destructive hover:bg-destructive/10
```

**Info icon (line ~152):**
```
BEFORE: text-blue-500
AFTER:  text-primary
```

**Flagged card border (line ~165):**
```
BEFORE: border-yellow-300
AFTER:  border-warning
```

### 4.5 `apps/admin/src/app/orders/page.tsx`

```
BEFORE: text-green-600 (line 110)
AFTER:  text-success

BEFORE: text-red-600 (line 125)
AFTER:  text-destructive
```

### 4.6 `apps/admin/src/app/sellers/page.tsx`

```
BEFORE: text-green-600 (lines 96, 111)
AFTER:  text-success

BEFORE: text-yellow-600 (line 106)
AFTER:  text-warning
```

### 4.7 `apps/admin/src/app/sellers/pending/page.tsx`

```
BEFORE: text-yellow-500 (warning icon, line 86)
AFTER:  text-warning

BEFORE: border-red-500 text-red-500 hover:bg-red-50 (reject button, line 190)
AFTER:  border-destructive text-destructive hover:bg-destructive/10

BEFORE: bg-green-600 text-white hover:bg-green-700 (approve button, line 193)
AFTER:  bg-success text-success-foreground hover:bg-success/90
```

### 4.8 `apps/admin/src/app/sellers/[id]/page.tsx`

```
BEFORE: border-red-500 text-red-500 hover:bg-red-50 (suspend, line 130)
AFTER:  border-destructive text-destructive hover:bg-destructive/10

BEFORE: bg-green-600 text-white hover:bg-green-700 (reactivate, line 135)
AFTER:  bg-success text-success-foreground hover:bg-success/90

BEFORE: text-yellow-500 (star rating, line 156)
AFTER:  text-warning

BEFORE: border-red-200 hover:bg-red-50 text-red-600, text-red-400 (delete, lines 373-376)
AFTER:  border-destructive/30 hover:bg-destructive/10 text-destructive, text-destructive/60
```

### 4.9 `apps/admin/src/app/analytics/page.tsx`

```
BEFORE: text-green-600 (positive trends, lines 227, 232, 237)
AFTER:  text-success
```

### 4.10 `apps/admin/src/components/dashboard/stats-card.tsx`

```
BEFORE: text-green-600 (up trend, line 17)
AFTER:  text-success

BEFORE: text-red-600 (down trend, line 18)
AFTER:  text-destructive
```

### 4.11 `apps/admin/src/components/layout/admin-header.tsx`

```
BEFORE: bg-red-500 (notification badge, line 31)
AFTER:  bg-destructive
```

### 4.12 `apps/admin/src/components/tables/data-table.tsx`

```
BEFORE: border-gray-300 (checkbox borders, lines 89, 122)
AFTER:  border-border (or replace with shadcn Checkbox in Phase 5)
```

### 4.13 `apps/admin/src/app/settings/page.tsx`

**Toggle switches (lines ~124, 136, 148, 160):**
```
BEFORE: bg-gray-200 ... after:border-white after:bg-white after:border-gray-300
AFTER:  Replace entirely with shadcn Switch component in Phase 5
         For now: bg-muted ... after:border-border after:bg-card after:border-border
```

## Acceptance Criteria

- [ ] No `text-red-*`, `bg-red-*` in admin app — replaced with `destructive`
- [ ] No `text-green-*`, `bg-green-*` — replaced with `success`
- [ ] No `text-yellow-*`, `bg-yellow-*` — replaced with `warning`
- [ ] No `text-blue-*`, `bg-blue-*` — replaced with `primary`
- [ ] No `text-gray-*`, `bg-gray-*` — replaced with `muted`/`muted-foreground`/`border`
- [ ] Dark mode classes simplified (no more `dark:bg-X-900/30 dark:text-X-400` — tokens handle both modes)
- [ ] Admin dashboard visually matches before/after
