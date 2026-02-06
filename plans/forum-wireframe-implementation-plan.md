# Forum Wireframe Implementation Plan

## Reference Documents
- Wireframe: Attached image showing Createconomy forum layout
- Design Document: Attached specifications for premium forum with Apple-level polish

---

## Phase 1: Navbar Fixes (High Priority)

### Task 1.1: Update Logo Text
**File:** [`apps/forum/src/components/navbar/navbar.tsx`](apps/forum/src/components/navbar/navbar.tsx:52)

**Current:**
```tsx
<span className="text-xl font-bold text-foreground">Forum</span>
```

**Change to:**
```tsx
<span className="text-xl font-bold text-foreground">Createconomy</span>
```

### Task 1.2: Add Dark Mode Toggle
**File:** [`apps/forum/src/components/navbar/navbar.tsx`](apps/forum/src/components/navbar/navbar.tsx:79)

**Add:** Dark mode toggle button using Moon/Sun icons from lucide-react

**Implementation:**
- Add `useTheme` hook from next-themes
- Add toggle button between search and notifications
- Use shadcn Button component with ghost variant

---

## Phase 2: Feed Tabs Enhancement (High Priority)

### Task 2.1: Add Favorites Tab
**File:** [`apps/forum/src/components/feed/feed-tabs.tsx`](apps/forum/src/components/feed/feed-tabs.tsx:12)

**Current tabs:** Hot, New, Top

**Add:** Fav tab with Heart icon

**Update type definition:**
**File:** [`apps/forum/src/types/forum.ts`](apps/forum/src/types/forum.ts:71)

```tsx
export type FeedTabType = 'hot' | 'new' | 'top' | 'fav';
```

---

## Phase 3: Left Sidebar Categories (High Priority)

### Task 3.1: Add Missing Categories
**File:** [`apps/forum/src/components/layout/left-sidebar.tsx`](apps/forum/src/components/layout/left-sidebar.tsx:33)

**Add to discoverItems array:**
```tsx
{ icon: MessageSquare, label: 'Debate', slug: 'debate', emoji: '💬' },
{ icon: Rocket, label: 'Launch', slug: 'launch', emoji: '🚀' },
```

---

## Phase 4: Discussion Card Enhancements (High Priority)

### Task 4.1: Add Three-Dot Menu
**File:** [`apps/forum/src/components/feed/discussion-card.tsx`](apps/forum/src/components/feed/discussion-card.tsx:73)

**Add:** MoreVertical icon with DropdownMenu containing:
- Share
- Report
- Hide
- Not interested

**shadcn Components:** DropdownMenu (already available)

### Task 4.2: Add Avatar Stack Component
**File:** Create new file `apps/forum/src/components/feed/avatar-stack.tsx`

**Purpose:** Show 5 circular avatars of recent participants overlapping

**Implementation:**
- Accept array of user avatars
- Display up to 5 with overlap (-8px margin)
- Show "+N" badge if more than 5

### Task 4.3: Integrate Avatar Stack into Discussion Card
**File:** [`apps/forum/src/components/feed/discussion-card.tsx`](apps/forum/src/components/feed/discussion-card.tsx:137)

**Add:** Avatar stack between comment count and bookmark button

---

## Phase 5: shadcn Component Additions (Medium Priority)

### Task 5.1: Add Tabs Component to UI Package
**File:** `packages/ui/src/components/tabs.tsx`

**Export from:** `packages/ui/src/index.ts`

### Task 5.2: Add Tooltip Component to UI Package
**File:** `packages/ui/src/components/tooltip.tsx`

**Export from:** `packages/ui/src/index.ts`

### Task 5.3: Add Switch Component to UI Package
**File:** `packages/ui/src/components/switch.tsx`

**Export from:** `packages/ui/src/index.ts`

---

## Phase 6: Polish and Refinements (Low Priority)

### Task 6.1: Add Tooltips to Icon Buttons
**Files:** 
- [`apps/forum/src/components/navbar/navbar.tsx`](apps/forum/src/components/navbar/navbar.tsx)
- [`apps/forum/src/components/feed/discussion-card.tsx`](apps/forum/src/components/feed/discussion-card.tsx)

**Add tooltips to:**
- Search button
- Dark mode toggle
- Notification bell
- Upvote button
- Comment button
- Bookmark button

### Task 6.2: Ensure Consistent Animation Timing
**File:** [`apps/forum/src/app/globals.css`](apps/forum/src/app/globals.css)

**Verify:** All transitions use 200-300ms for micro-interactions

---

## Implementation Checklist

### Phase 1: Navbar
- [ ] Change logo text to "Createconomy"
- [ ] Add dark mode toggle button
- [ ] Install next-themes if not present

### Phase 2: Feed Tabs
- [ ] Add 'fav' to FeedTabType
- [ ] Add Fav tab with Heart icon
- [ ] Implement favorites filtering logic

### Phase 3: Left Sidebar
- [ ] Add Debate category with 💬 emoji
- [ ] Add Launch category with 🚀 emoji

### Phase 4: Discussion Card
- [ ] Add three-dot menu with DropdownMenu
- [ ] Create AvatarStack component
- [ ] Integrate avatar stack into card
- [ ] Add mock participant data

### Phase 5: UI Package
- [ ] Add Tabs component
- [ ] Add Tooltip component
- [ ] Add Switch component
- [ ] Update index.ts exports

### Phase 6: Polish
- [ ] Add tooltips to all icon buttons
- [ ] Verify animation consistency
- [ ] Test dark mode throughout

---

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `apps/forum/src/components/navbar/navbar.tsx` | 1, 6 | Logo text, dark mode toggle, tooltips |
| `apps/forum/src/components/feed/feed-tabs.tsx` | 2 | Add Fav tab |
| `apps/forum/src/types/forum.ts` | 2 | Add 'fav' to FeedTabType |
| `apps/forum/src/components/layout/left-sidebar.tsx` | 3 | Add Debate, Launch categories |
| `apps/forum/src/components/feed/discussion-card.tsx` | 4, 6 | Three-dot menu, avatar stack, tooltips |
| `apps/forum/src/components/feed/avatar-stack.tsx` | 4 | New file |
| `packages/ui/src/components/tabs.tsx` | 5 | New file |
| `packages/ui/src/components/tooltip.tsx` | 5 | New file |
| `packages/ui/src/components/switch.tsx` | 5 | New file |
| `packages/ui/src/index.ts` | 5 | Export new components |

---

## shadcn/ui Components Summary

### Currently Used ✅
- Button
- Card, CardContent, CardHeader, CardTitle
- Avatar, AvatarImage, AvatarFallback
- Badge
- Input
- DropdownMenu (all variants)
- Separator

### To Be Added
- Tabs (for feed tabs - optional, current implementation works)
- Tooltip (for icon hints)
- Switch (for dark mode toggle - optional, can use Button)

---

## Notes

1. **All components must use shadcn/ui patterns** - Import from `@createconomy/ui`
2. **Maintain existing animation system** - Use fadeInUp, fadeInRight keyframes
3. **Keep responsive design** - Test at lg and xl breakpoints
4. **Dark mode support** - All new components must work in both themes
