# Phase 3: Replace Hardcoded Colors in Forum App

> Replace all hardcoded Tailwind named colors in `apps/forum/src/` with design tokens.

## Prerequisites

- Phase 2 (design tokens) must be complete

## File-by-File Changes

### 3.1 `apps/forum/src/components/feed/discussion-card.tsx`

**Voting colors (lines ~134-164):**
```
BEFORE: text-orange-500, hover:bg-orange-100, dark:hover:bg-orange-900/30
AFTER:  text-upvote, hover:bg-upvote/10, dark:hover:bg-upvote/10

BEFORE: text-blue-500, hover:bg-blue-100, dark:hover:bg-blue-900/30
AFTER:  text-downvote, hover:bg-downvote/10, dark:hover:bg-downvote/10
```

**Category colors map (lines ~35-42):**
```
BEFORE: Record with bg-blue-500, bg-pink-500, bg-orange-500, bg-violet-500, bg-green-500, bg-cyan-500
AFTER:  Remove hardcoded map entirely. Use a dynamic approach with `style={{ backgroundColor: category.color }}` from the database, or use the primary token with opacity variants.
```

**Post type badges (lines ~241-243):**
```
BEFORE: bg-blue-100 text-blue-700, bg-green-100 text-green-700, bg-purple-100 text-purple-700
AFTER:  bg-primary/10 text-primary, bg-success/10 text-success, bg-primary/10 text-primary
```

**Glow gradient (line ~350):** Keep as-is (uses rgba for the radial gradient effect, which is fine for visual effects).

### 3.2 `apps/forum/src/components/comments/comment-node.tsx`

**Voting colors (lines ~205-233):**
```
BEFORE: text-orange-500, hover:bg-orange-100, dark:hover:bg-orange-900/30
AFTER:  text-upvote, hover:bg-upvote/10, dark:hover:bg-upvote/10

BEFORE: text-blue-500, hover:bg-blue-100, dark:hover:bg-blue-900/30
AFTER:  text-downvote, hover:bg-downvote/10, dark:hover:bg-downvote/10
```

### 3.3 `apps/forum/src/app/t/[id]/page.tsx`

**Voting colors (lines ~162-190):**
```
Same pattern as discussion-card.tsx — replace orange-500 with upvote, blue-500 with downvote
```

### 3.4 `apps/forum/src/components/navbar/navbar.tsx`

**Theme toggle icon (line ~120):**
```
BEFORE: text-yellow-500
AFTER:  text-warning
```

**Notification icons (lines ~179-194):**
```
BEFORE: text-blue-500 (reply), text-red-500 (upvote), text-purple-500 (mention), text-green-500 (follow), text-yellow-500 (campaign), text-orange-500 (pin/lock/mod)
AFTER:  text-primary (reply), text-destructive (upvote/heart), text-primary (mention), text-success (follow), text-warning (campaign), text-upvote (pin/lock/mod)
```

### 3.5 `apps/forum/src/app/account/notifications/inbox/page.tsx`

**Same notification icon pattern as navbar (lines ~96-112):** Apply identical token replacements as navbar.tsx.

### 3.6 `apps/forum/src/components/moderation/report-dialog.tsx`

```
BEFORE: text-yellow-500 (AlertTriangle, line 110)
AFTER:  text-warning

BEFORE: text-green-500 (CheckCircle2, line 124)
AFTER:  text-success
```

### 3.7 `apps/forum/src/components/layout/left-sidebar.tsx`

```
BEFORE: text-yellow-500 (Crown, lines 115, 148)
AFTER:  text-warning
```

### 3.8 `apps/forum/src/components/widgets/leaderboard.tsx`

```
BEFORE: text-yellow-500 (Crown, line 25)
AFTER:  text-warning

BEFORE: text-gray-400 (Medal, line 27)
AFTER:  text-muted-foreground

BEFORE: text-amber-600 (Award, line 29)
AFTER:  text-warning
```

### 3.9 `apps/forum/src/components/widgets/whats-vibing.tsx`

```
BEFORE: bg-orange-500/20 text-orange-500, bg-amber-500/20 text-amber-500, bg-yellow-500/20 text-yellow-500
AFTER:  bg-upvote/20 text-upvote, bg-warning/20 text-warning, bg-warning/20 text-warning

BEFORE: text-orange-500 (Flame)
AFTER:  text-upvote

BEFORE: text-green-500 (TrendingUp)
AFTER:  text-success
```

### 3.10 `apps/forum/src/components/post-types/poll-widget.tsx`

```
BEFORE: text-orange-500 (lines 27, 186)
AFTER:  text-warning
```

### 3.11 `apps/forum/src/components/feed/featured-slider.tsx`

```
BEFORE: bg-yellow-500/90 text-black (pinned badge, line 186)
AFTER:  bg-warning text-warning-foreground
```

### 3.12 `apps/forum/src/components/embeds/media-embeds.tsx`

```
BEFORE: bg-red-600 (YouTube play button, line 48)
AFTER:  Keep as-is — this is a YouTube brand color, not a design system color
```

### 3.13 `apps/forum/src/components/auth/user-menu.tsx`

```
BEFORE: text-red-600 hover:bg-red-500/10 (logout button, line 172)
AFTER:  text-destructive hover:bg-destructive/10
```

### 3.14 `apps/forum/src/app/u/[username]/page.tsx`

**Role colors map (lines ~49-54):**
```
BEFORE: bg-red-100 text-red-800 (admin), bg-blue-100 text-blue-800 (moderator), etc.
AFTER:  bg-destructive/10 text-destructive (admin), bg-primary/10 text-primary (moderator), bg-muted text-muted-foreground (customer), bg-success/10 text-success (seller)
```

### 3.15 `apps/forum/src/components/forum/category-card.tsx`

**Color classes map (lines ~22-31):**
```
BEFORE: 8 hardcoded color classes
AFTER:  Remove map. Use dynamic style from category.color field, or simplify to: bg-primary/10 text-primary border-primary/20 for all
```

### 3.16 `apps/forum/src/components/forum/user-badge.tsx`

**Role colors (lines ~20-25):**
```
BEFORE: bg-red-500/10 text-red-600 (admin), bg-blue-500/10 text-blue-600 (moderator), etc.
AFTER:  bg-destructive/10 text-destructive (admin), bg-primary/10 text-primary (moderator), bg-muted text-muted-foreground (member), bg-warning/10 text-warning (vip)
```

**Avatar color array (lines ~37-55):** Keep as-is — this is for generating random avatar background colors based on username hash. These serve a legitimate visual diversity purpose.

### 3.17 `apps/forum/src/components/forum/post-card.tsx`

```
BEFORE: bg-red-500/10 text-red-600 (admin), bg-blue-500/10 text-blue-600 (moderator), bg-gray-500/10 text-gray-600
AFTER:  bg-destructive/10 text-destructive (admin), bg-primary/10 text-primary (moderator), bg-muted text-muted-foreground

BEFORE: bg-red-500/10 text-red-600 (liked), text-red-600 (delete)
AFTER:  bg-destructive/10 text-destructive, text-destructive
```

### 3.18 `apps/forum/src/components/forum/thread-card.tsx`

```
BEFORE: bg-yellow-500/10 text-yellow-600 (pinned)
AFTER:  bg-warning/10 text-warning

BEFORE: bg-red-500/10 text-red-600 (locked)
AFTER:  bg-destructive/10 text-destructive

BEFORE: bg-orange-500/10 text-orange-600 (hot)
AFTER:  bg-upvote/10 text-upvote
```

### 3.19 `apps/forum/src/components/forum/reply-form.tsx`

```
BEFORE: text-red-600 (error message, line 166)
AFTER:  text-destructive
```

### 3.20 `apps/forum/src/app/account/flair/page.tsx`

```
BEFORE: text-green-600 (success message, line 162)
AFTER:  text-success
```

### 3.21 `apps/forum/src/components/flairs/user-flair.tsx`

```
BEFORE: backgroundColor: '#e5e7eb', color: '#374151' (fallback, lines 28-29)
AFTER:  Keep as-is — these are dynamic user-set colors from the database with reasonable fallbacks
```

### 3.22 `apps/forum/src/app/account/notifications/page.tsx`

```
BEFORE: border-gray-300 (checkbox, lines 179, 189, 210)
AFTER:  border-border (or replace with shadcn Checkbox in Phase 5)

BEFORE: text-green-600 (success message, line 244)
AFTER:  text-success
```

## Acceptance Criteria

- [ ] No `text-red-*`, `bg-red-*` used for non-YouTube brand purposes
- [ ] No `text-orange-*`, `bg-orange-*` — replaced with `upvote` token
- [ ] No `text-blue-*`, `bg-blue-*` — replaced with `primary`/`downvote`
- [ ] No `text-green-*`, `bg-green-*` — replaced with `success`
- [ ] No `text-yellow-*`, `bg-yellow-*` — replaced with `warning`
- [ ] No `text-purple-*` — replaced with `primary`
- [ ] No `text-amber-*` — replaced with `warning`
- [ ] Avatar color array in `user-badge.tsx` kept as exception
- [ ] YouTube brand color in `media-embeds.tsx` kept as exception
- [ ] User flair dynamic colors kept as exception
- [ ] Visual appearance matches before/after (colors are similar, just tokenized)
