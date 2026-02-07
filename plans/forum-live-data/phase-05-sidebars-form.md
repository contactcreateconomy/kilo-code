# Phase 05 — Sidebars & Discussion Form

**Files to modify**:
- [`apps/forum/src/components/layout/left-sidebar.tsx`](../../apps/forum/src/components/layout/left-sidebar.tsx)
- [`apps/forum/src/components/discussion/community-dropdown.tsx`](../../apps/forum/src/components/discussion/community-dropdown.tsx)
- [`apps/forum/src/components/discussion/discussion-form.tsx`](../../apps/forum/src/components/discussion/discussion-form.tsx)
- [`apps/forum/src/components/layout/sidebar.tsx`](../../apps/forum/src/components/layout/sidebar.tsx) (old sidebar used by detail pages)

## Changes

### 1. `left-sidebar.tsx` — Replace mockCategories with live data

**Current**: Imports `mockCategories` from `@/data/mock-data` but does not actually use it in the render — the sidebar uses hardcoded `discoverItems` and `premiumItems` arrays instead. The `mockCategories` import is unused or vestigial.

**Target**:
- Remove the `mockCategories` import
- The `discoverItems` array is not mock data per se — it is a UI navigation structure. However, to make it dynamic, we should populate it from `forumCategories` in the DB.
- Call `useCategories()` hook to get live categories
- Map categories to sidebar items, using the icon/emoji from the DB
- The "Active Campaign" card in the sidebar should also use `useActiveCampaign()` instead of hardcoded "Win Claude Pro!" text

```diff
- import { mockCategories } from '@/data/mock-data';
+ import { useCategories } from '@/hooks/use-forum';
+ import { useActiveCampaign } from '@/hooks/use-campaign';
```

For the "Discover" section, dynamically populate from DB categories:

```typescript
const { categories, isLoading: categoriesLoading } = useCategories();

// Map categories to discover items
const discoverItems = categories.map((cat) => ({
  label: cat.name,
  slug: cat.slug,
  emoji: cat.icon ?? "💬",
}));
```

For the campaign card at the bottom:

```diff
- <h4 className="text-sm font-bold mb-1">Win Claude Pro!</h4>
- <p className="text-xs text-muted-foreground mb-3">Top contributors win 3 months free</p>
- <div className="h-1.5 bg-muted rounded-full overflow-hidden">
-   <div className="h-full bg-primary rounded-full w-[49%]..." />
- </div>
- <p className="text-[10px] text-muted-foreground mt-1">2,450 / 5,000 pts</p>
+ {campaign && (
+   <>
+     <h4 className="text-sm font-bold mb-1">{campaign.title}</h4>
+     <p className="text-xs text-muted-foreground mb-3">{campaign.description}</p>
+     <div className="h-1.5 bg-muted rounded-full overflow-hidden">
+       <div className="h-full bg-primary rounded-full transition-all" 
+         style={{ width: `${Math.round(campaign.progress / campaign.targetPoints * 100)}%` }} />
+     </div>
+     <p className="text-[10px] text-muted-foreground mt-1">
+       {campaign.progress.toLocaleString()} / {campaign.targetPoints.toLocaleString()} pts
+     </p>
+   </>
+ )}
```

If no campaign is active, hide the campaign card.

### 2. `community-dropdown.tsx` — Populate from live categories

**Current**: Has hardcoded `communityItems` array (lines 14-24) with static emoji-labeled categories.

**Target**:
- Remove the hardcoded `communityItems` constant
- Accept categories as a prop or fetch them internally using `useCategories()`
- Map DB categories to dropdown items

Two approaches:
- **Option A**: Fetch inside the component (self-contained)
- **Option B**: Accept a `categories` prop from the parent `DiscussionForm`

Recommendation: **Option B** — the parent `DiscussionForm` already knows which category is selected, and it needs the category ID for the mutation. So pass the live categories from the form.

```typescript
interface CommunityDropdownProps {
  value: string; // category ID (Convex ID)
  onChange: (value: string) => void;
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    icon?: string | null;
  }>;
  className?: string;
}
```

### 3. `discussion-form.tsx` — Wire to Convex createThread mutation

**Current**: The form simulates submission with `setTimeout` (line 150-151) and navigates to the category page.

**Target**:
- Import and call `useForum()` hook for `createThread` mutation
- Import `useCategories()` to populate the community dropdown with live categories
- On submit, call `createThread({ title, content: body, categoryId })` where `categoryId` is a Convex `Id<"forumCategories">`
- On success, navigate to the new thread: `router.push(/t/${threadId})`
- Handle errors from the mutation
- Remove the `localStorage` draft logic or keep it as a progressive enhancement

```diff
+ import { useForum, useCategories } from '@/hooks/use-forum';
+ import { useAuth } from '@/hooks/use-auth';

  export function DiscussionForm({ className }: DiscussionFormProps) {
    const router = useRouter();
+   const { createThread } = useForum();
+   const { categories, isLoading: categoriesLoading } = useCategories();
+   const { isAuthenticated } = useAuth();
    
-   const [community, setCommunity] = useState('');
+   const [categoryId, setCategoryId] = useState('');
```

The submit handler becomes:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!categoryId) {
    setError('Please select a community.');
    return;
  }

  if (!title.trim()) {
    setError('Please enter a title for your discussion.');
    return;
  }

  if (!body.trim() || body.trim().length < 10) {
    setError('Content must be at least 10 characters.');
    return;
  }

  setIsSubmitting(true);

  try {
    const threadId = await createThread({
      title: title.trim(),
      content: body.trim(),
      categoryId,
    });

    localStorage.removeItem('discussion-draft');
    router.push(`/t/${threadId}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create discussion.');
  } finally {
    setIsSubmitting(false);
  }
};
```

If user is not authenticated, show a sign-in prompt instead of the form.

### 4. `sidebar.tsx` — Replace default categories with live data

**Current**: Has hardcoded `defaultCategories` array (lines 21-82) and `--` placeholders for stats.

**Target**:
- Make this a client component (add `"use client"`)
- Call `useCategories()` for the category list
- Call `useCommunityStats()` for the stats section
- Remove `defaultCategories` constant

```diff
+ "use client";
+ import { useCategories } from '@/hooks/use-forum';
+ import { useCommunityStats } from '@/hooks/use-community-stats';

- const defaultCategories: Category[] = [...];

  export function Sidebar({ currentCategory }: SidebarProps) {
+   const { categories, isLoading: catLoading } = useCategories();
+   const { stats, isLoading: statsLoading } = useCommunityStats();
    
+   // Map Convex categories to the expected shape
+   const displayCategories = categories.map((cat) => ({
+     id: cat._id,
+     name: cat.name,
+     slug: cat.slug,
+     description: cat.description ?? "",
+     threadCount: cat.threadCount ?? 0,
+     postCount: cat.postCount ?? 0,
+     icon: cat.icon ?? "💬",
+     color: cat.color ?? "blue",
+   }));
```

For the stats section:
```diff
- <span className="font-medium">--</span>
+ <span className="font-medium">{statsLoading ? "..." : stats.members}</span>
```
