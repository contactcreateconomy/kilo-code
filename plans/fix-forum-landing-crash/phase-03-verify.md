# Phase 03 — Verification

## Objective

Confirm the forum landing page loads successfully with zero posts and that the post creation flow works end-to-end.

## Verification Steps

### Step 1: Landing page loads with zero posts

1. Start the forum dev server: `pnpm --filter @createconomy/forum dev`
2. Open `http://localhost:3001` in a browser
3. Verify:
   - Page renders without errors (no error boundary fallbacks triggered)
   - Discussion feed shows "No discussions yet — Be the first to start a conversation!"
   - Featured slider is hidden (no featured posts)
   - Right sidebar widgets render: leaderboard shows "No leaderboard data yet", trending shows "No trending topics yet", community stats show "0" values, campaign widget is hidden (no active campaign)
   - Left sidebar renders correctly with Discover and Premium sections
   - Navbar renders with logo, search bar, dark mode toggle, and Sign In button
4. Check browser console for errors — should be zero errors

### Step 2: Post creation flow

1. Sign in via Google OAuth or email/password
2. Click "Start Discussion" button in the left sidebar
3. Navigate to `/t/new`
4. Verify the DiscussionForm renders:
   - Community dropdown loads categories from Convex (via `listForumCategories`)
   - Title input works
   - Body textarea works
   - Tags can be added
5. Select a community, enter a title (min 5 chars), enter body text (min 10 chars)
6. Click "Post"
7. Verify:
   - Redirects to the new thread page `/t/[id]`
   - Thread page renders with the posted content
8. Navigate back to homepage `/`
9. Verify:
   - The new discussion appears in the feed
   - Discussion card shows correct title, author, category, timestamp

### Step 3: Error resilience

1. Temporarily break one widget's data source (e.g., by modifying the leaderboard query name)
2. Verify the rest of the page still renders correctly
3. The broken widget shows the error fallback message
4. Revert the intentional break

### Step 4: Console and network audit

1. Open browser DevTools Network tab
2. Refresh the landing page
3. Verify all Convex WebSocket messages return valid data (no error frames)
4. Check the Console tab for any remaining warnings or errors

## Done Criteria

- Landing page loads with zero runtime errors
- Empty state is shown for all sections when no data exists
- Post creation works and new posts appear in the feed
- Individual widget failures don't crash the entire page
- No console errors in the browser
