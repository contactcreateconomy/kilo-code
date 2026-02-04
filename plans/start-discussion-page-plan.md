# Start Discussion Page Implementation Plan

## Overview

Create a new "Start Discussion" page that opens when clicking the "Start Discussion" button in the left sidebar. The page should maintain the existing app's design language while providing a clean, focused writing experience.

## Reference Screenshot Analysis

Based on the provided screenshot (Reddit-style create post interface):
- **Header**: "Create post" title with "Drafts" link
- **Community Selector**: Dropdown to select community
- **Post Type Tabs**: Text, Images & Video, Link, Poll (to be removed per requirements)
- **Title Input**: Required field with 300 character limit
- **Tags**: "Add tags" button
- **Rich Text Editor**: Toolbar with formatting options (Bold, Italic, Strikethrough, Superscript, Heading, Link, Image, Video, Lists, Code, Quote, etc.)
- **Body Text**: Optional content area
- **Actions**: Save Draft and Post buttons

## Requirements Summary

1. ✅ Include left sidebar navigation (reuse existing `LeftSidebar` component)
2. ✅ Main content spans center + right sections (no right sidebar)
3. ✅ Community dropdown populated from Discover section items
4. ✅ Remove text/image/link toggle buttons
5. ✅ Keep image and link insertion in editor toolbar
6. ✅ Maintain consistent styling with existing app

---

## Phase 1: Page Structure and Layout

### Task 1.1: Update `/t/new/page.tsx`
**File**: [`apps/forum/src/app/t/new/page.tsx`](../apps/forum/src/app/t/new/page.tsx)

Replace the existing simple form with a new layout that includes:
- Navbar (existing)
- Left sidebar (reuse `LeftSidebar` component)
- Main content area spanning center + right columns
- Mobile responsive design

### Task 1.2: Create Page Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                        Navbar                                │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   Left       │         Start Discussion Panel               │
│   Sidebar    │         (spans center + right)               │
│   (250px)    │                                               │
│              │                                               │
│              │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

---

## Phase 2: Community Dropdown Component

### Task 2.1: Create Community Dropdown
**File**: `apps/forum/src/components/discussion/community-dropdown.tsx` (new)

Populate dropdown with items from the Discover section in [`left-sidebar.tsx`](../apps/forum/src/components/layout/left-sidebar.tsx:32-42):

```typescript
const discoverItems = [
  { icon: Newspaper, label: 'News', slug: 'news', emoji: '📰' },
  { icon: Star, label: 'Review', slug: 'review', emoji: '⭐' },
  { icon: Scale, label: 'Compare', slug: 'compare', emoji: '⚖️' },
  { icon: List, label: 'List', slug: 'list', emoji: '📋' },
  { icon: HelpCircle, label: 'Help', slug: 'help', emoji: '❓' },
  { icon: Sparkles, label: 'Showcase', slug: 'showcase', emoji: '✨' },
  { icon: GraduationCap, label: 'Tutorial', slug: 'tutorial', emoji: '📚' },
  { icon: Scale, label: 'Debate', slug: 'debate', emoji: '💬' },
  { icon: Rocket, label: 'Launch', slug: 'launch', emoji: '🚀' },
];
```

Features:
- Dark themed dropdown matching screenshot
- Emoji + label display
- Chevron down icon
- Selected state display

---

## Phase 3: Discussion Writing Panel

### Task 3.1: Create Discussion Form Component
**File**: `apps/forum/src/components/discussion/discussion-form.tsx` (new)

Components:
1. **Header Section**
   - "Create post" / "Start Discussion" title
   - "Drafts" link (top right)

2. **Community Selector**
   - Use CommunityDropdown component

3. **Title Input**
   - Required field
   - Character counter (0/300)
   - Placeholder: "Title*"

4. **Tags Section**
   - "Add tags" button
   - Tag input/selection (optional enhancement)

5. **Rich Text Editor Toolbar**
   - Bold (B)
   - Italic (i)
   - Strikethrough (S)
   - Superscript (X²)
   - Heading (TT)
   - Link (🔗)
   - Image (🖼️)
   - Video (▶️)
   - Unordered List
   - Ordered List
   - Code Block (<>)
   - Quote (66)
   - Code Inline (</>)
   - Spoiler
   - Table
   - More options (...)

6. **Body Text Area**
   - Placeholder: "Body text (optional)"
   - Resizable
   - Markdown support

7. **Action Buttons**
   - "Save Draft" (secondary/outline)
   - "Post" (primary, disabled until valid)

---

## Phase 4: Styling and Theming

### Task 4.1: Apply Consistent Styling
- Use existing CSS variables from [`globals.css`](../apps/forum/src/app/globals.css)
- Dark mode support using `.dark` class
- Glassmorphism effects where appropriate
- Border colors: `border-border`
- Background: `bg-card` for panels
- Text: `text-foreground`, `text-muted-foreground`

### Task 4.2: Responsive Design
- Mobile: Full width, sidebar hidden
- Tablet: Sidebar visible, content adapts
- Desktop: Full three-column layout (but right sidebar empty/hidden)

---

## Phase 5: Functionality

### Task 5.1: Form State Management
- Title state with validation
- Body content state
- Selected community state
- Tags state (array)
- Draft saving (localStorage initially)

### Task 5.2: Image/Link Insertion
- Image: Open file picker or URL input modal
- Link: Open URL input modal with text and URL fields
- Insert at cursor position in body

### Task 5.3: Form Submission
- Validate required fields (title, community)
- Show loading state
- Handle success/error
- Redirect to new discussion on success

---

## File Structure

```
apps/forum/src/
├── app/
│   └── t/
│       └── new/
│           └── page.tsx (updated)
├── components/
│   └── discussion/
│       ├── index.ts (new - exports)
│       ├── community-dropdown.tsx (new)
│       ├── discussion-form.tsx (new)
│       ├── editor-toolbar.tsx (new)
│       └── tag-input.tsx (new - optional)
└── data/
    └── mock-data.ts (may need to export discoverItems)
```

---

## Component Dependencies

```mermaid
graph TD
    A[/t/new/page.tsx] --> B[Navbar]
    A --> C[LeftSidebar]
    A --> D[DiscussionForm]
    D --> E[CommunityDropdown]
    D --> F[EditorToolbar]
    D --> G[TagInput]
    E --> H[discoverItems data]
    F --> I[Image/Link Modals]
```

---

## Implementation Order

1. **Phase 1**: Update page layout structure
2. **Phase 2**: Create CommunityDropdown component
3. **Phase 3**: Create DiscussionForm with basic inputs
4. **Phase 4**: Add EditorToolbar with formatting buttons
5. **Phase 5**: Implement image/link insertion modals
6. **Phase 6**: Add form validation and submission
7. **Phase 7**: Style refinements and responsive testing

---

## UI Components to Use

From `@createconomy/ui`:
- `Button` - For actions
- `Input` - For title field
- `DropdownMenu` - For community selector
- `Badge` - For tags
- `Card` - For panel container
- `cn` - For class merging

---

## Acceptance Criteria

- [ ] Page accessible via `/t/new` route
- [ ] Left sidebar visible on desktop (reuses existing component)
- [ ] Main content spans center + right area
- [ ] Community dropdown shows all Discover section items
- [ ] No text/image/link toggle tabs visible
- [ ] Editor toolbar includes image and link buttons
- [ ] Title field with character counter
- [ ] Body text area with placeholder
- [ ] Save Draft and Post buttons functional
- [ ] Consistent dark/light mode styling
- [ ] Mobile responsive layout
