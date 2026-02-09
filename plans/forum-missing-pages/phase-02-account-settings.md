# Phase 02 — Account Settings Gaps

Missing account settings sub-pages and features within the `/account` layout.

---

## 2.1 `/account/security` — Security Settings Page

**Severity**: 🟡 Medium — Expected in any forum with accounts

**Current state**: Does NOT exist. The account sidebar in [`account-content.tsx`](../../apps/forum/src/app/account/account-content.tsx:6) only has 3 nav items:
```tsx
const navItems = [
  { href: "/account", label: "Profile", icon: "👤" },
  { href: "/account/notifications", label: "Notifications", icon: "🔔" },
  { href: "/account/flair", label: "Flair", icon: "🏷️" },
];
```

**What it needs**:
- Password change form (if password auth is supported)
- Connected accounts section showing Google/GitHub OAuth links
- Active sessions list with "sign out all" functionality
- Two-factor authentication toggle (future consideration)
- Account export / data download option

**Backend**: The sessions table and [`deleteAccount`](../../packages/convex/convex/functions/users.ts:497) mutation exist. Sessions can be queried via `by_user` index.

---

## 2.2 `/account/privacy` — Privacy Settings Page

**Severity**: 🟢 Low-Medium — Nice to have for a mature forum

**Current state**: Does NOT exist.

**What it needs**:
- Profile visibility toggle: public vs. followers-only
- Show/hide activity on profile: threads, replies, upvotes
- Show/hide online status
- Block list management
- Data deletion request option

**Backend gap**: The `userProfiles` schema would need additional fields like `isPublic`, `showActivity`, `showOnlineStatus`.

---

## 2.3 `/account/appearance` — Appearance/Theme Settings Page

**Severity**: 🟢 Low — Theme toggle exists in navbar already

**Current state**: Does NOT exist as a dedicated page. Theme toggle exists in [`theme-toggle.tsx`](../../apps/forum/src/components/navbar/theme-toggle.tsx).

**What it needs**:
- Theme selection: light / dark / system
- Compact vs. comfortable post density
- Font size preference
- These preferences could be stored in the `preferences` field of `userProfiles`

**Backend**: The `updateUserProfile` mutation already accepts a `preferences` object.

---

## 2.4 `/account/blocked` — Blocked Users Page

**Severity**: 🟢 Low-Medium — Standard for social forums

**Current state**: Does NOT exist. No blocking system exists yet.

**What it needs**:
- List of blocked users with unblock button
- Search for users to block

**Backend gap**: No `blockedUsers` table or blocking mutations exist. Would need:
- `blockedUsers` table with `blockerId` + `blockedId`
- `blockUser` / `unblockUser` mutations
- Filter blocked users from feeds and notifications

---

## 2.5 Account Settings Sidebar — Missing Navigation Items

The account sidebar needs to be updated to include new pages:

```tsx
const navItems = [
  { href: "/account", label: "Profile", icon: "👤" },
  { href: "/account/notifications", label: "Notifications", icon: "🔔" },
  { href: "/account/flair", label: "Flair", icon: "🏷️" },
  // Missing items:
  { href: "/account/security", label: "Security", icon: "🔒" },
  { href: "/account/privacy", label: "Privacy", icon: "👁️" },
  { href: "/account/appearance", label: "Appearance", icon: "🎨" },
  { href: "/account/blocked", label: "Blocked Users", icon: "🚫" },
];
```

---

## Implementation Checklist

- [ ] Add `/account/security` page (sessions, connected accounts)
- [ ] Add `/account/privacy` page (visibility settings)
- [ ] Add `/account/appearance` page (theme, density)
- [ ] Add `/account/blocked` page (blocked users management)
- [ ] Update [`account-content.tsx`](../../apps/forum/src/app/account/account-content.tsx:6) nav items
- [ ] Add active nav highlighting in account sidebar
- [ ] Add backend: blocked users table + mutations (if implementing blocking)
- [ ] Add backend: session listing query for security page
