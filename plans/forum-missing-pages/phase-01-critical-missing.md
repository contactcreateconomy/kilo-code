# Phase 01 — Critical Missing Pages

Pages that are actively linked in navigation or referenced in code but do not exist yet.

---

## 1.1 `/auth/forgot-password` — Forgot Password Page

**Severity**: 🔴 High — Linked from [`sign-in page`](../../apps/forum/src/app/auth/signin/page.tsx:39)

**Evidence**: The sign-in page has a direct link:
```tsx
<Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
  Forgot your password?
</Link>
```

**What it needs**:
- Email input form
- Call to a password reset mutation or send a reset email via Convex auth
- Success confirmation state
- Link back to sign-in

**Backend**: The app uses `@convex-dev/auth` with Google/GitHub OAuth. If password auth is also planned, this page is essential. If OAuth-only, the link should be removed.

**Action**: Either implement the page or remove the dead link from the sign-in form.

---

## 1.2 `/terms` — Terms of Service Page

**Severity**: 🟡 Medium — Linked from [`sign-in page`](../../apps/forum/src/app/auth/signin/page.tsx:27)

**Evidence**:
```tsx
<Link href="/terms" className="text-primary hover:underline">
  Terms of Service
</Link>
```

**What it needs**:
- Static page with Terms of Service content
- Server component with metadata for SEO

---

## 1.3 `/privacy` — Privacy Policy Page

**Severity**: 🟡 Medium — Linked from [`sign-in page`](../../apps/forum/src/app/auth/signin/page.tsx:30)

**Evidence**:
```tsx
<Link href="/privacy" className="text-primary hover:underline">
  Privacy Policy
</Link>
```

**What it needs**:
- Static page with Privacy Policy content
- Server component with metadata for SEO

---

## 1.4 `/account` Profile Settings — Uses Hardcoded Data

**Severity**: 🔴 High — Page exists but is non-functional

**Evidence**: In [`account/page.tsx`](../../apps/forum/src/app/account/page.tsx:8), the entire form is hardcoded:
```tsx
const [displayName, setDisplayName] = useState("John Doe");
const [username, setUsername] = useState("johndoe");
const [bio, setBio] = useState("Digital creator and marketplace enthusiast.");
const [email, setEmail] = useState("john@example.com");
```

The save handler is a mock `setTimeout`:
```tsx
await new Promise((resolve) => setTimeout(resolve, 1000));
```

**What it needs**:
- Load current user profile via `useQuery(api.functions.users.getCurrentUser)`
- Save changes via `useMutation(api.functions.users.updateUserProfile)`
- Avatar upload with actual file handling
- Username validation against existing usernames
- Proper success/error toast notifications
- The "Delete Account" button should call `api.functions.users.deleteAccount` with a confirmation dialog

**Backend**: `updateUserProfile` mutation already exists in [`users.ts`](../../packages/convex/convex/functions/users.ts:212) accepting `displayName`, `bio`, `avatarUrl`, `phone`, `address`, `preferences`. The `deleteAccount` mutation also exists at [line 497](../../packages/convex/convex/functions/users.ts:497).

---

## 1.5 User Profile Tabs are Non-Functional

**Severity**: 🟡 Medium — UI exists but tabs don't work

**Evidence**: In [`u/[username]/page.tsx`](../../apps/forum/src/app/u/[username]/page.tsx:203), the tabs are hardcoded buttons with no state switching:
```tsx
<button className="px-4 py-2 border-b-2 border-primary font-medium">
  Recent Activity
</button>
<button className="px-4 py-2 text-muted-foreground hover:text-foreground">
  Threads ({profile.threadCount})
</button>
<button className="px-4 py-2 text-muted-foreground hover:text-foreground">
  Replies ({profile.postCount})
</button>
```

**What it needs**:
- Tab state management (useState or URL params)
- "Threads" tab should show user's threads (data exists via `getUserThreads`)
- "Replies" tab needs a backend query for user's posts/replies
- "Recent Activity" should show combined feed

**Backend gap**: There is no `getUserPosts` / `getUserReplies` query yet — only `getUserThreads` exists.

---

## Implementation Checklist

- [ ] Decide: Keep or remove `/auth/forgot-password` link (depends on auth strategy)
- [ ] Create `/auth/forgot-password` page OR remove dead link
- [ ] Create `/terms` static page
- [ ] Create `/privacy` static page
- [ ] Connect `/account` page to real Convex data (getCurrentUser + updateUserProfile)
- [ ] Wire up "Delete Account" button with confirmation dialog + deleteAccount mutation
- [ ] Add avatar upload functionality
- [ ] Make user profile tabs functional with state switching
- [ ] Create backend `getUserReplies` query for the Replies tab
