# Phase 4 — Page Rewiring

## Goal
Replace inline mock data functions in forum page components with Convex query calls. These pages are **server components** and cannot use React hooks. They need to be converted to client components or use a `fetchQuery` approach.

## Challenge: Server Components vs Convex Hooks
The three pages with mock data are currently server components using `async` functions:
- [`apps/forum/src/app/c/[slug]/page.tsx`](apps/forum/src/app/c/[slug]/page.tsx) — Category page
- [`apps/forum/src/app/t/[id]/page.tsx`](apps/forum/src/app/t/[id]/page.tsx) — Thread detail page
- [`apps/forum/src/app/u/[username]/page.tsx`](apps/forum/src/app/u/[username]/page.tsx) — User profile page

Convex queries are typically consumed via `useQuery()` hooks, which require client components. Two approaches:

### Approach A: Convert to Client Components
Convert each page to `'use client'` and use `useQuery()` hooks. This loses SSR/SEO benefits but is simpler.

### Approach B: Use `fetchQuery` for Server Components
Convex provides `fetchQuery()` for server-side data fetching. However, this requires a ConvexHTTPClient, and the current project may not have this set up.

### Chosen Approach: Convert to Client Components
Since the forum app already uses `'use client'` for its homepage and most components, and the mock data pages dont currently benefit from real server-side data fetching, we will convert them to client components. This is the simplest path and consistent with the rest of the app.

---

## Page 1: [`apps/forum/src/app/page.tsx`](apps/forum/src/app/page.tsx) — Homepage

**Current state**: Imports `mockDiscussions` and passes to `<DiscussionFeed initialDiscussions={mockDiscussions} />`

**Changes**:
- Remove `import { mockDiscussions } from '@/data/mock-data'`
- The `DiscussionFeed` component will be updated in Phase 3 to fetch data internally via `useDiscussions()` hook
- Remove the `initialDiscussions` prop from the `<DiscussionFeed>` usage
- The `DiscussionFeed` component interface changes: remove `initialDiscussions` prop, data fetched internally

---

## Page 2: [`apps/forum/src/app/c/[slug]/page.tsx`](apps/forum/src/app/c/[slug]/page.tsx) — Category Page

**Current state**: Server component with `getCategory(slug)` inline mock function returning hardcoded categories.

**Changes**:
- Add `'use client'` directive
- Remove the `getCategory()` mock function entirely (lines 11-56)
- Import `useCategoryBySlug` and `useThreads` from `@/hooks/use-forum`
- Use `useParams()` from `next/navigation` to get the slug
- Call `const { category, isLoading } = useCategoryBySlug(slug)`
- Replace `category.threadCount` etc. with values from the query
- For the `ThreadList`, pass the category ID to filter threads
- Remove `generateMetadata` export (client components cannot export async metadata). Set `<title>` dynamically using `useEffect` + `document.title` or a `<Head>` component instead.
- Handle loading and not-found states with conditional rendering instead of `notFound()`

---

## Page 3: [`apps/forum/src/app/t/[id]/page.tsx`](apps/forum/src/app/t/[id]/page.tsx) — Thread Detail Page

**Current state**: Server component with `getThread(id)` and `getThreadPosts(threadId, page)` inline mock functions.

**Changes**:
- Add `'use client'` directive
- Remove `getThread()` mock function (lines 29-80) and `getThreadPosts()` mock function (lines 83-136)
- Import `useThread` and `usePostComments` from `@/hooks/use-forum`
- Use `useParams()` to get the thread ID
- Call `const { thread, isLoading } = useThread(id)`
- The existing `useThread()` hook already wraps the `getThread` Convex query — it returns thread data with category, author, posts
- Remove `generateMetadata` export
- Handle loading/not-found states with conditional rendering
- The `PostList` component already receives posts as props — get posts from the thread query

---

## Page 4: [`apps/forum/src/app/u/[username]/page.tsx`](apps/forum/src/app/u/[username]/page.tsx) — User Profile Page

**Current state**: Server component with `getUser(username)` inline mock function for "admin" and "johndoe".

**Changes**:
- Add `'use client'` directive
- Remove `getUser()` mock function (lines 10-49)
- Import `useUserProfile` from `@/hooks/use-forum`
- Use `useParams()` to get the username
- Call `const { user, isLoading } = useUserProfile(username)`
- The new `getUserByUsername` query from Phase 2 returns: `username, displayName, avatarUrl, bio, role, joinedAt, threadCount, postCount, reputation`
- Remove `generateMetadata` export
- Handle loading/not-found states with conditional rendering

---

## Metadata Handling
Since converting to client components loses `generateMetadata` support, add a simple `<title>` element using Next.js `<Metadata>` component or `useEffect` pattern:

```typescript
useEffect(() => {
  if (user) {
    document.title = `${user.displayName} (@${user.username}) | Createconomy Forum`;
  }
}, [user]);
```

Alternatively, create a shared `<PageTitle>` component that sets `document.title`.

---

## Additional Page: [`apps/forum/src/app/c/page.tsx`](apps/forum/src/app/c/page.tsx) — Categories List

Check if this page has mock data. It likely displays all categories — update it to use the `useCategories()` hook if it currently has hardcoded data.
