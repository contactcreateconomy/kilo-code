# Phase 3: Component-Level Action Guards

## Goal
Gate individual interactive actions (upvote, bookmark, reply, report, etc.) so unauthenticated users are redirected to sign-in when they try to perform these actions, rather than silently failing.

---

## Task 3.1: Update ReplyForm — Use `useAuth` Internally

**File**: [`apps/forum/src/components/forum/reply-form.tsx`](apps/forum/src/components/forum/reply-form.tsx) (MODIFY)

Current state: Accepts `isAuthenticated` as a prop (default `false`). The thread detail page never passes it, so the form **always** shows the "You must be signed in" message.

Changes:
- Remove the `isAuthenticated` prop
- Import `useAuth` from `@/hooks/use-auth` and use it internally
- Keep the existing unauthenticated UI (sign-in prompt card) but use internal auth state
- Update the sign-in link to include `returnTo` for the current thread path

```tsx
export function ReplyForm({ threadId, ... }: ReplyFormProps) {
  const { isAuthenticated, isLoading } = useAuth();
  // ...

  if (isLoading) {
    return <Skeleton />; // or spinner
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-card rounded-lg border p-6 text-center">
        <p className="text-muted-foreground mb-4">
          You must be signed in to reply to this thread.
        </p>
        <Button asChild>
          <Link href={`/auth/signin?returnTo=/t/${threadId}`}>Sign In</Link>
        </Button>
      </div>
    );
  }
  // ... rest of form
}
```

Also update [`ThreadPage`](apps/forum/src/app/t/[id]/page.tsx:216) to remove the unused `isAuthenticated` prop from `<ReplyForm>`.

---

## Task 3.2: Guard Upvote and Bookmark in DiscussionCard

**File**: [`apps/forum/src/components/feed/discussion-card.tsx`](apps/forum/src/components/feed/discussion-card.tsx:67) (MODIFY)

Current state: `handleUpvote` and `handleBookmark` call `toggle()` in a try/catch that silently ignores auth errors.

Changes:
- Import `useAuthAction` from `@/hooks/use-auth-action`
- Wrap upvote/bookmark handler calls with `requireAuth()`

```tsx
export function DiscussionCard({ discussion, index = 0 }: DiscussionCardProps) {
  const { requireAuth } = useAuthAction();
  const { hasReaction, toggle } = useReactions('thread', [discussion.id]);
  // ...

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      await toggle(discussion.id, 'upvote');
    });
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(async () => {
      await toggle(discussion.id, 'bookmark');
    });
  };
  // ...
}
```

---

## Task 3.3: Guard Like/Share/Report on Thread Detail Page

**File**: [`apps/forum/src/app/t/[id]/page.tsx`](apps/forum/src/app/t/[id]/page.tsx:162) (MODIFY)

Current state: Like, Share, and Report buttons (lines 162-170) have no `onClick` handlers — they're just presentational.

Changes:
- Import `useAuthAction`
- Add `onClick` handlers that use `requireAuth()` to gate these actions
- For now, the actual action logic can be placeholder (these features aren't fully implemented yet), but the auth gating should be in place

```tsx
const { requireAuth } = useAuthAction();

<Button variant="ghost" size="sm" onClick={() => requireAuth(() => {
  // TODO: implement like action
})}>
  Like
</Button>
```

---

## Task 3.4: Guard "Start Discussion" Button in LeftSidebar

**File**: [`apps/forum/src/components/layout/left-sidebar.tsx`](apps/forum/src/components/layout/left-sidebar.tsx:54) (MODIFY)

Current state: The "Start Discussion" button is a simple `<Link href="/t/new">` — clicking it navigates to the new discussion page regardless of auth state.

Two options:
1. **Keep it as-is** — since Phase 2 guards `/t/new` at the page level, clicking this while unauthenticated will redirect from the page guard. This is acceptable UX.
2. **Proactive guard** — intercept the click, check auth, and redirect immediately to sign-in without loading the `/t/new` page first.

**Recommended**: Option 1 is sufficient since the page guard handles it. But if we want a snappier UX, use `useAuthAction`:

```tsx
const { requireAuth, isAuthenticated } = useAuthAction();

// Replace Link with conditional behavior
<Button 
  className="w-full" 
  onClick={() => requireAuth(() => router.push('/t/new'))}
>
  <Plus /> Start Discussion
</Button>
```

Or keep the `Link` and let page-level guard handle it. Either approach works. **Decision: keep `Link` and rely on page guard for simplicity.**

---

## Task 3.5: Guard Report/Share/Not-Interested in DiscussionCard Dropdown

**File**: [`apps/forum/src/components/feed/discussion-card.tsx`](apps/forum/src/components/feed/discussion-card.tsx:131) (MODIFY)

Current state: The three-dot menu has Share, Report, and "Not interested" items with no onClick handlers.

Changes:
- Share can remain un-gated (it's just copying a link, no auth needed)
- Report and "Not interested" should be gated with `requireAuth()`

```tsx
<DropdownMenuItem onClick={(e) => {
  e.stopPropagation();
  requireAuth(() => {
    // TODO: implement report
  });
}}>
  <Flag /> Report
</DropdownMenuItem>
```

---

## Acceptance Criteria

- [ ] ReplyForm checks auth internally — shows sign-in prompt for unauthenticated users
- [ ] Clicking upvote while unauthenticated redirects to sign-in
- [ ] Clicking bookmark while unauthenticated redirects to sign-in
- [ ] Clicking Like/Report on thread detail while unauthenticated redirects to sign-in
- [ ] All sign-in redirects include `returnTo` with the current page path
- [ ] Authenticated users experience zero behavior change
- [ ] No silent failures — every auth-required action gives clear feedback
