# Phase 5: Replace Custom Components with shadcn Equivalents

> Replace hand-built UI patterns with proper shadcn components for consistency and accessibility.

## Prerequisites

- Phase 1 (shadcn install) must be complete

## Component Replacements

### 5.1 Replace raw checkboxes with shadcn `Checkbox`

**Files:**
- `apps/admin/src/components/tables/data-table.tsx` (lines ~89, 122)
- `apps/forum/src/app/account/notifications/page.tsx` (lines ~179, 189, 210)

**Before:**
```tsx
<input
  type="checkbox"
  checked={...}
  onChange={...}
  className="rounded border-gray-300"
/>
```

**After:**
```tsx
import { Checkbox } from '@createconomy/ui';

<Checkbox
  checked={...}
  onCheckedChange={...}
/>
```

### 5.2 Replace raw toggles with shadcn `Switch`

**File:** `apps/admin/src/app/settings/page.tsx` (4 instances, lines ~123-160)

**Before:**
```tsx
<label className="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" defaultChecked className="sr-only peer" />
  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
</label>
```

**After:**
```tsx
import { Switch, Label } from '@createconomy/ui';

<div className="flex items-center gap-2">
  <Switch id="email-notifications" defaultChecked />
  <Label htmlFor="email-notifications">Email notifications</Label>
</div>
```

### 5.3 Replace raw selects with shadcn `Select`

**File:** `apps/admin/src/app/moderation/reviews/page.tsx` (line ~143 area)

**Before:**
```tsx
<select className="rounded-md border px-3 py-2 text-sm">
  <option value="all">All reviews</option>
  ...
</select>
```

**After:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@createconomy/ui';

<Select defaultValue="all">
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Filter reviews" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All reviews</SelectItem>
    ...
  </SelectContent>
</Select>
```

### 5.4 Add Tooltips to icon-only buttons

**Files with icon-only buttons lacking tooltips:**
- `apps/forum/src/components/feed/discussion-card.tsx` (vote buttons, bookmark, share, flag)
- `apps/forum/src/components/comments/comment-node.tsx` (vote buttons)
- `apps/forum/src/app/t/[id]/page.tsx` (vote buttons)
- `apps/forum/src/components/navbar/navbar.tsx` (bell, search, theme toggle)

**Pattern to apply:**
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@createconomy/ui';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button ...>
        <ArrowBigUp />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Upvote</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**Note:** Wrap the app-level layout with `<TooltipProvider>` once, then use `<Tooltip>` in individual components without needing `<TooltipProvider>` each time.

### 5.5 Replace custom report modal with shadcn `Dialog`

**File:** `apps/forum/src/components/moderation/report-dialog.tsx`

The current implementation uses a custom overlay + animated div. Replace with:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@createconomy/ui';

<Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Report {targetLabel}</DialogTitle>
      <DialogDescription>Select a reason for your report</DialogDescription>
    </DialogHeader>
    {/* ...existing form content... */}
  </DialogContent>
</Dialog>
```

### 5.6 Replace `.data-table` CSS with shadcn `Table`

**Files:**
- `packages/ui/src/globals.css` — Remove `.data-table` CSS class (lines ~301-318)
- Any admin components using `.data-table` class

**Note:** The existing `apps/admin/src/components/tables/data-table.tsx` is a full custom implementation. This is a larger refactor. For now, just ensure it uses the shadcn `Table` primitives for styling consistency. Full replacement can be a follow-up.

### 5.7 Replace custom poll progress bar with shadcn `Progress`

**File:** `apps/forum/src/components/post-types/poll-widget.tsx`

The current implementation likely uses a `div` with dynamic `width` styling. Replace the visual bar with:

```tsx
import { Progress } from '@createconomy/ui';

<Progress value={percentage} className="h-2" />
```

## Acceptance Criteria

- [ ] All raw `<input type="checkbox">` replaced with shadcn `Checkbox` (6 instances)
- [ ] All raw toggle switches replaced with shadcn `Switch` (4 instances)
- [ ] All raw `<select>` replaced with shadcn `Select`
- [ ] Report dialog uses shadcn `Dialog`
- [ ] Icon-only buttons have `Tooltip` wrappers
- [ ] Poll progress bars use shadcn `Progress`
- [ ] `pnpm typecheck` passes
- [ ] Visual appearance preserved or improved
