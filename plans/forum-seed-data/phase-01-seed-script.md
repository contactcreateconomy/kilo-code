# Phase 1 — Seed Script

## Goal
Create an idempotent Convex seed script at [`packages/convex/convex/functions/seed.ts`](packages/convex/convex/functions/seed.ts) that populates all forum-related tables with realistic data. The script uses Convex `internalMutation` so it can bypass auth checks and directly insert data.

## Why `internalMutation`?
- Normal mutations require authentication via `getAuthUserId()`
- The seed script needs to create users and insert data on their behalf
- Internal mutations are only callable from the Convex dashboard or other server-side functions, not from the client

## Idempotency Strategy
1. Before inserting, the seed script checks for a sentinel record — a `forumCategories` entry with `slug: "__seed_marker__"`
2. If the marker exists, all seed data is deleted first (clear all forum tables + seed users/profiles)
3. The marker is inserted at the end of seeding
4. This makes the script safe to run multiple times

## File: `packages/convex/convex/functions/seed.ts`

### Exports
- `seedForum` — `internalMutation` that runs the full seed process
- `clearSeedData` — `internalMutation` that only clears seed data

### Seed Data Structure

#### 10 Users
Each user gets an entry in both the `users` table (auth table) and `userProfiles` table.

Since the `users` table is managed by `@convex-dev/auth`, we cannot insert directly into it. Instead, the seed script will:
1. Insert into `userProfiles` with a reference to a user ID
2. Since we cannot create auth users programmatically without OAuth, we need an alternative approach

**Revised approach**: Create a dedicated seed that inserts directly into the Convex `users` table using `ctx.db.insert`. The `@convex-dev/auth` `authTables` spread adds a `users` table that is a normal Convex table — we can insert into it from internal mutations. We just need to provide the required fields.

The `users` table from `@convex-dev/auth` has these fields: `name`, `email`, `image`, `emailVerificationTime`, `phone`, `phoneVerificationTime`, `isAnonymous`.

```typescript
// 10 seed users with varied personas
const SEED_USERS = [
  { name: 'Sarah Chen', username: 'sarahchen', email: 'sarah.chen@seed.test', bio: 'Full-stack developer and open-source enthusiast. Building the future one commit at a time.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah' },
  { name: 'Alex Rivera', username: 'alexr', email: 'alex.r@seed.test', bio: 'AI researcher at Stanford. Passionate about making ML accessible to everyone.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=alex' },
  { name: 'Emily Watson', username: 'emilyw', email: 'emily.w@seed.test', bio: 'UX designer turned startup founder. Design thinking evangelist.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=emily' },
  { name: 'Marcus Johnson', username: 'marcusj', email: 'marcus.j@seed.test', bio: 'Serial entrepreneur. 3x founder. Currently building in the creator economy space.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=marcus' },
  { name: 'David Kim', username: 'davidk', email: 'david.k@seed.test', bio: 'Game developer and pixel art aficionado. Making indie games since 2018.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=david' },
  { name: 'Lisa Park', username: 'lisap', email: 'lisa.p@seed.test', bio: 'Technical writer and documentation advocate. Words matter.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=lisa' },
  { name: 'Tom Wilson', username: 'tomw', email: 'tom.w@seed.test', bio: 'Backend engineer specializing in distributed systems. Rust and Go enthusiast.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=tom' },
  { name: 'Nina Brown', username: 'ninab', email: 'nina.b@seed.test', bio: 'Data scientist by day, generative art explorer by night.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=nina' },
  { name: 'James Lee', username: 'jamesl', email: 'james.l@seed.test', bio: 'DevOps engineer. Cloud infrastructure and CI/CD pipelines are my jam.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=james' },
  { name: 'Amy Zhang', username: 'amyz', email: 'amy.z@seed.test', bio: 'Product manager and community builder. Bridging users and developers.', avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=amy' },
];
```

Registration dates should be staggered: the first user joins ~6 months ago, the last user joins ~2 weeks ago.

#### 6 Forum Categories
These match the existing mock categories but are stored in the database:

```typescript
const SEED_CATEGORIES = [
  { name: 'Programming', slug: 'programming', description: 'Discuss programming languages, frameworks, tools, and best practices.', icon: 'Code', color: 'bg-blue-500', sortOrder: 1 },
  { name: 'Design', slug: 'design', description: 'UI/UX design, graphic design, and creative tools discussions.', icon: 'Palette', color: 'bg-pink-500', sortOrder: 2 },
  { name: 'Startups', slug: 'startups', description: 'Entrepreneurship, funding, growth strategies, and startup life.', icon: 'Rocket', color: 'bg-orange-500', sortOrder: 3 },
  { name: 'AI & ML', slug: 'ai-ml', description: 'Artificial intelligence, machine learning, and data science discussions.', icon: 'Brain', color: 'bg-violet-500', sortOrder: 4 },
  { name: 'Gaming', slug: 'gaming', description: 'Game development, reviews, and the gaming industry.', icon: 'Gamepad2', color: 'bg-green-500', sortOrder: 5 },
  { name: 'Learning', slug: 'learning', description: 'Courses, tutorials, self-improvement, and educational resources.', icon: 'BookOpen', color: 'bg-cyan-500', sortOrder: 6 },
];
```

#### 20 Forum Threads
- Distributed across all 6 categories (at least 1 per category, up to 5 in popular ones)
- Each thread has a realistic title and substantive first-post content
- No images in posts
- Authored by different users with uneven distribution:
  - Sarah (5 threads), Alex (4), Emily (3), Marcus (3), David (2), Lisa (1), Tom (1), Nina (1), others (0)
- Timestamps staggered over last 3 months
- 2 threads pinned
- None locked
- Thread slugs auto-generated from title

For each thread:
1. Insert into `forumThreads`
2. Insert first post into `forumPosts` with `isFirstPost: true`
3. Update `forumCategories` thread/post counts

#### Comments & Replies
For each of the 20 threads, generate 1–8 additional posts (replies) by random seed users. Then for a subset of posts, add 0–4 comments in `forumComments`. Total target: ~60 replies + ~40 comments.

#### Reactions
For each thread/post/comment, generate upvotes/downvotes/bookmarks in `forumReactions`:
- Threads: 5–50 upvotes, 0–5 downvotes, 0–10 bookmarks
- Posts: 0–20 upvotes, 0–3 downvotes
- Comments: 0–10 upvotes

Reactions are attributed to seed users. Each user-target pair is unique (one reaction per type per user per target).

After inserting reactions, update the corresponding `upvoteCount` on threads and `likeCount` on posts/comments.

#### View Counts
Set realistic view counts on threads: 50–2000 views, correlated with upvote count.

#### User Points
Insert into `userPoints` table for each seed user:
- `totalPoints`: derived from their contributions (threads created * 50 + posts * 20 + comments * 10 + upvotes received * 5)
- `weeklyPoints`: subset of total
- `monthlyPoints`: subset of total
- `level`: totalPoints / 1000 rounded
- `badges`: assigned based on points thresholds

#### Campaign
Insert one active campaign into `forumCampaigns`:
```typescript
{
  title: 'Win Claude Pro!',
  description: 'Top contributors this month win 3 months of Claude Pro subscription.',
  prize: 'Claude Pro (3 months)',
  startDate: now - 16 days,
  endDate: now + 14 days,
  targetPoints: 5000,
  currentProgress: calculated from seed user monthlyPoints,
  participantCount: 8, // 8 of 10 seed users
  isActive: true,
}
```

### Execution
The seed script is run via the Convex dashboard or CLI:
```bash
cd packages/convex && npx convex run functions/seed:seedForum
```

### Important Implementation Notes
1. All `createdAt`/`updatedAt` timestamps must be epoch milliseconds (not ISO strings)
2. Use `ctx.db.insert()` for all table insertions
3. The script must be a single `internalMutation` or broken into multiple internal mutations called sequentially via an `internalAction`
4. Since Convex mutations have execution limits, if the data volume is too large, use an `internalAction` that calls multiple smaller `internalMutation`s
5. Use deterministic random seeding for reproducibility (e.g., index-based selection rather than `Math.random()`)
