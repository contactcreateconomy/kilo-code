# Phase 10 — Tag & Flair System

> **Priority:** 🟡 Medium  
> **Depends on:** None (can run independently)  
> **Enables:** Better content organization, filtering, user identity

## Problem

The current tag system is incomplete:
- Tags exist in the creation form (`apps/forum/src/components/discussion/discussion-form.tsx`) but are client-side only
- The schema has `forumTags` and `forumThreadTags` tables but they aren't used
- There are no post flairs (moderator-managed labels like "Solved", "Bug", "Discussion")
- There are no user flairs (badges/roles visible on posts)

## Goal

Implement a complete tagging and flair system:
1. **Thread Tags** — User-applied topic tags (e.g., "react", "nextjs", "help")
2. **Post Flairs** — Moderator-managed labels per category
3. **User Flairs** — Visible badges/roles on user posts within categories

---

## Schema Changes

### Update existing `forumTags` table

```typescript
forumTags: defineTable({
  tenantId: v.optional(v.id("tenants")),
  name: v.string(),           // Lowercase, normalized
  displayName: v.string(),    // Display version
  slug: v.string(),
  description: v.optional(v.string()),
  color: v.optional(v.string()),  // Hex color for badge
  usageCount: v.number(),     // Denormalized count
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_name", ["name"])
  .index("by_slug", ["slug"])
  .index("by_usage", ["usageCount"])
```

### Update existing `forumThreadTags` table

```typescript
forumThreadTags: defineTable({
  threadId: v.id("forumThreads"),
  tagId: v.id("forumTags"),
  createdAt: v.number(),
})
  .index("by_thread", ["threadId"])
  .index("by_tag", ["tagId"])
```

### New table: `postFlairs`

Moderator-defined flairs for each category:

```typescript
postFlairs: defineTable({
  tenantId: v.optional(v.id("tenants")),
  categoryId: v.id("forumCategories"),
  name: v.string(),
  displayName: v.string(),
  backgroundColor: v.string(),    // e.g., "#22c55e"
  textColor: v.string(),          // e.g., "#ffffff"
  emoji: v.optional(v.string()),  // Optional emoji prefix
  isModOnly: v.boolean(),         // Can only be applied by mods
  sortOrder: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_category", ["categoryId", "sortOrder"])
```

### New table: `userFlairs`

User-specific flairs within categories:

```typescript
userFlairs: defineTable({
  tenantId: v.optional(v.id("tenants")),
  categoryId: v.optional(v.id("forumCategories")),  // Null = global flair
  userId: v.id("users"),
  text: v.string(),              // Custom text (e.g., "Pro Seller", "Moderator")
  emoji: v.optional(v.string()), // Optional emoji
  backgroundColor: v.optional(v.string()),
  textColor: v.optional(v.string()),
  isCustom: v.boolean(),         // User-customized vs assigned
  assignedBy: v.optional(v.id("users")),  // If assigned by mod
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_user_category", ["userId", "categoryId"])
```

### Update `forumThreads` table

```typescript
// Add to forumThreads
flairId: v.optional(v.id("postFlairs")),
```

---

## Backend Functions

### File: `packages/convex/convex/functions/tags.ts`

#### Tag Queries

```typescript
export const searchTags = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Get all tags and filter (could use full-text search in production)
    const tags = await ctx.db
      .query("forumTags")
      .order("desc")
      .take(100);
    
    const filtered = tags
      .filter(t => t.name.includes(args.query.toLowerCase()))
      .slice(0, limit);
    
    return filtered;
  },
});

export const getPopularTags = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    const tags = await ctx.db
      .query("forumTags")
      .withIndex("by_usage")
      .order("desc")
      .take(limit);
    
    return tags;
  },
});

export const getThreadTags = query({
  args: { threadId: v.id("forumThreads") },
  handler: async (ctx, args) => {
    const threadTags = await ctx.db
      .query("forumThreadTags")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
    
    const tags = await Promise.all(
      threadTags.map(tt => ctx.db.get(tt.tagId))
    );
    
    return tags.filter(Boolean);
  },
});
```

#### Tag Mutations

```typescript
export const addTagsToThread = mutation({
  args: {
    threadId: v.id("forumThreads"),
    tagNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");
    
    // Only author can add tags
    if (thread.authorId !== userId) {
      throw new Error("Only the author can add tags");
    }
    
    // Limit to 5 tags
    if (args.tagNames.length > 5) {
      throw new Error("Maximum 5 tags allowed");
    }
    
    const now = Date.now();
    
    for (const tagName of args.tagNames) {
      const normalizedName = tagName.toLowerCase().trim();
      
      // Find or create tag
      let tag = await ctx.db
        .query("forumTags")
        .withIndex("by_name", (q) => q.eq("name", normalizedName))
        .first();
      
      if (!tag) {
        const tagId = await ctx.db.insert("forumTags", {
          name: normalizedName,
          displayName: tagName.trim(),
          slug: normalizedName.replace(/\s+/g, "-"),
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        });
        tag = await ctx.db.get(tagId);
      }
      
      if (!tag) continue;
      
      // Check if already tagged
      const existing = await ctx.db
        .query("forumThreadTags")
        .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
        .filter((q) => q.eq(q.field("tagId"), tag!._id))
        .first();
      
      if (!existing) {
        await ctx.db.insert("forumThreadTags", {
          threadId: args.threadId,
          tagId: tag._id,
          createdAt: now,
        });
        
        // Update usage count
        await ctx.db.patch(tag._id, {
          usageCount: tag.usageCount + 1,
          updatedAt: now,
        });
      }
    }
    
    return { success: true };
  },
});

export const removeTagFromThread = mutation({
  args: {
    threadId: v.id("forumThreads"),
    tagId: v.id("forumTags"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.authorId !== userId) {
      throw new Error("Not authorized");
    }
    
    const threadTag = await ctx.db
      .query("forumThreadTags")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .filter((q) => q.eq(q.field("tagId"), args.tagId))
      .first();
    
    if (threadTag) {
      await ctx.db.delete(threadTag._id);
      
      // Update usage count
      const tag = await ctx.db.get(args.tagId);
      if (tag) {
        await ctx.db.patch(args.tagId, {
          usageCount: Math.max(0, tag.usageCount - 1),
          updatedAt: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});
```

### File: `packages/convex/convex/functions/flairs.ts`

#### Post Flair Functions

```typescript
export const getCategoryFlairs = query({
  args: { categoryId: v.id("forumCategories") },
  handler: async (ctx, args) => {
    const flairs = await ctx.db
      .query("postFlairs")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return flairs;
  },
});

export const setThreadFlair = mutation({
  args: {
    threadId: v.id("forumThreads"),
    flairId: v.optional(v.id("postFlairs")),  // Null to remove
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");
    
    // Check authorization
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    const isModOrAdmin = 
      profile?.defaultRole === "admin" || 
      profile?.defaultRole === "moderator";
    
    // If flair is mod-only, require mod
    if (args.flairId) {
      const flair = await ctx.db.get(args.flairId);
      if (flair?.isModOnly && !isModOrAdmin) {
        throw new Error("This flair can only be applied by moderators");
      }
      
      // Verify flair belongs to thread's category
      if (flair?.categoryId !== thread.categoryId) {
        throw new Error("Flair not available for this category");
      }
    }
    
    // Author or mod can set flair
    if (thread.authorId !== userId && !isModOrAdmin) {
      throw new Error("Not authorized");
    }
    
    await ctx.db.patch(args.threadId, {
      flairId: args.flairId ?? undefined,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Admin function to manage flairs
export const createPostFlair = mutation({
  args: {
    categoryId: v.id("forumCategories"),
    name: v.string(),
    displayName: v.string(),
    backgroundColor: v.string(),
    textColor: v.string(),
    emoji: v.optional(v.string()),
    isModOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Require admin role
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (profile?.defaultRole !== "admin") {
      throw new Error("Admin role required");
    }
    
    const now = Date.now();
    
    // Get current max sort order
    const existing = await ctx.db
      .query("postFlairs")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    
    const maxOrder = existing.reduce((max, f) => Math.max(max, f.sortOrder), 0);
    
    const flairId = await ctx.db.insert("postFlairs", {
      ...args,
      sortOrder: maxOrder + 1,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return flairId;
  },
});
```

#### User Flair Functions

```typescript
export const getUserFlair = query({
  args: {
    userId: v.id("users"),
    categoryId: v.optional(v.id("forumCategories")),
  },
  handler: async (ctx, args) => {
    // First check category-specific flair
    if (args.categoryId) {
      const categoryFlair = await ctx.db
        .query("userFlairs")
        .withIndex("by_user_category", (q) => 
          q.eq("userId", args.userId).eq("categoryId", args.categoryId)
        )
        .first();
      
      if (categoryFlair) return categoryFlair;
    }
    
    // Fall back to global flair
    const globalFlair = await ctx.db
      .query("userFlairs")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", args.userId).eq("categoryId", undefined)
      )
      .first();
    
    return globalFlair ?? null;
  },
});

export const setUserFlair = mutation({
  args: {
    categoryId: v.optional(v.id("forumCategories")),
    text: v.string(),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    
    // Validate text length
    if (args.text.length > 30) {
      throw new Error("Flair text must be 30 characters or less");
    }
    
    const now = Date.now();
    
    // Check for existing flair
    const existing = await ctx.db
      .query("userFlairs")
      .withIndex("by_user_category", (q) => 
        q.eq("userId", userId).eq("categoryId", args.categoryId)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        text: args.text,
        emoji: args.emoji,
        isCustom: true,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userFlairs", {
        userId,
        categoryId: args.categoryId,
        text: args.text,
        emoji: args.emoji,
        isCustom: true,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    return { success: true };
  },
});
```

---

## Frontend Components

### 1. Tag Input Component

#### `apps/forum/src/components/tags/tag-input.tsx`

```typescript
interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export function TagInput({ 
  value, 
  onChange, 
  maxTags = 5,
  placeholder = "Add tag..." 
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (query.length >= 2) {
      const results = await searchTags({ query, limit: 5 });
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);
  
  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !value.includes(normalized) && value.length < maxTags) {
      onChange([...value, normalized]);
      setInput('');
      setShowSuggestions(false);
    }
  };
  
  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button onClick={() => removeTag(tag)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        
        {value.length < maxTags && (
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                debouncedSearch(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(input);
                }
              }}
              placeholder={placeholder}
              className="w-32"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-1 w-48 bg-card border rounded-lg shadow-lg z-10">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion._id}
                    onClick={() => addTag(suggestion.name)}
                    className="w-full px-3 py-2 text-left hover:bg-accent"
                  >
                    <span>{suggestion.displayName}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {suggestion.usageCount} uses
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} tags
      </p>
    </div>
  );
}
```

### 2. Post Flair Selector

#### `apps/forum/src/components/flairs/flair-selector.tsx`

```typescript
interface FlairSelectorProps {
  categoryId: string;
  value?: string;
  onChange: (flairId: string | undefined) => void;
}

export function FlairSelector({ categoryId, value, onChange }: FlairSelectorProps) {
  const { flairs, isLoading } = useCategoryFlairs(categoryId);
  const [open, setOpen] = useState(false);
  
  const selectedFlair = flairs?.find(f => f._id === value);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start">
          {selectedFlair ? (
            <FlairBadge flair={selectedFlair} />
          ) : (
            <span className="text-muted-foreground">Add flair</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-1">
          {/* None option */}
          <button
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="w-full px-2 py-1.5 text-left rounded hover:bg-accent"
          >
            <span className="text-muted-foreground">No flair</span>
          </button>
          
          {/* Flair options */}
          {flairs?.map(flair => (
            <button
              key={flair._id}
              onClick={() => {
                onChange(flair._id);
                setOpen(false);
              }}
              className={cn(
                "w-full px-2 py-1.5 text-left rounded hover:bg-accent",
                value === flair._id && "bg-accent"
              )}
            >
              <FlairBadge flair={flair} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 3. Flair Badge Component

#### `apps/forum/src/components/flairs/flair-badge.tsx`

```typescript
interface FlairBadgeProps {
  flair: {
    displayName: string;
    backgroundColor: string;
    textColor: string;
    emoji?: string;
  };
  size?: 'sm' | 'md';
}

export function FlairBadge({ flair, size = 'sm' }: FlairBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 font-medium",
        size === 'sm' ? 'text-xs py-0.5' : 'text-sm py-1'
      )}
      style={{
        backgroundColor: flair.backgroundColor,
        color: flair.textColor,
      }}
    >
      {flair.emoji && <span className="mr-1">{flair.emoji}</span>}
      {flair.displayName}
    </span>
  );
}
```

### 4. User Flair Display

#### `apps/forum/src/components/flairs/user-flair.tsx`

```typescript
interface UserFlairProps {
  userId: string;
  categoryId?: string;
  className?: string;
}

export function UserFlair({ userId, categoryId, className }: UserFlairProps) {
  const { flair, isLoading } = useUserFlair(userId, categoryId);
  
  if (!flair || isLoading) return null;
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs",
        className
      )}
      style={{
        backgroundColor: flair.backgroundColor ?? '#e5e7eb',
        color: flair.textColor ?? '#374151',
      }}
    >
      {flair.emoji && <span className="mr-1">{flair.emoji}</span>}
      {flair.text}
    </span>
  );
}
```

---

## Integration Points

### Discussion Form

Update to use `TagInput`:

```typescript
// apps/forum/src/components/discussion/discussion-form.tsx
const [tags, setTags] = useState<string[]>([]);
const [flairId, setFlairId] = useState<string>();

// In form
<TagInput value={tags} onChange={setTags} />
<FlairSelector 
  categoryId={community} 
  value={flairId} 
  onChange={setFlairId} 
/>

// On submit
await createThread({
  title,
  content,
  categoryId,
  tags,
  flairId,
});
```

### Discussion Card

Show tags and flair:

```typescript
// apps/forum/src/components/feed/discussion-card.tsx
<div className="flex items-center gap-2 mb-2">
  {discussion.flair && (
    <FlairBadge flair={discussion.flair} />
  )}
  {discussion.tags?.map(tag => (
    <Link 
      key={tag.slug} 
      href={`/search?tag=${tag.slug}`}
      className="text-xs text-muted-foreground hover:text-primary"
    >
      #{tag.displayName}
    </Link>
  ))}
</div>
```

### User Profile

Add flair customization:

```typescript
// apps/forum/src/app/account/flair/page.tsx
export default function FlairSettingsPage() {
  const { flair, setFlair } = useMyFlair();
  
  return (
    <div>
      <h1>Customize Your Flair</h1>
      <Input 
        value={flair?.text ?? ''} 
        onChange={(e) => setFlair({ text: e.target.value })}
        placeholder="Your flair text"
        maxLength={30}
      />
      <p className="text-sm text-muted-foreground">
        This will appear next to your name on posts
      </p>
    </div>
  );
}
```

---

## Admin Flair Management

Add to admin app:

```typescript
// apps/admin/src/app/categories/[id]/flairs/page.tsx
export default function CategoryFlairsPage() {
  const params = useParams<{ id: string }>();
  const { flairs, createFlair, updateFlair, deleteFlair } = useCategoryFlairs(params.id);
  
  return (
    <div>
      <h1>Post Flairs</h1>
      
      {/* Flair list with drag-to-reorder */}
      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="flairs">
          {flairs.map((flair, index) => (
            <FlairRow 
              key={flair._id} 
              flair={flair} 
              index={index}
              onEdit={updateFlair}
              onDelete={deleteFlair}
            />
          ))}
        </Droppable>
      </DragDropContext>
      
      {/* Add new flair button */}
      <Button onClick={() => setShowCreateModal(true)}>
        Add Flair
      </Button>
    </div>
  );
}
```

---

## Implementation Checklist

- [ ] Update `forumTags` table schema
- [ ] Ensure `forumThreadTags` table exists
- [ ] Create `postFlairs` table
- [ ] Create `userFlairs` table
- [ ] Add `flairId` to `forumThreads`
- [ ] Create `packages/convex/convex/functions/tags.ts`
- [ ] Implement `searchTags` query
- [ ] Implement `getPopularTags` query
- [ ] Implement `getThreadTags` query
- [ ] Implement `addTagsToThread` mutation
- [ ] Implement `removeTagFromThread` mutation
- [ ] Create `packages/convex/convex/functions/flairs.ts`
- [ ] Implement `getCategoryFlairs` query
- [ ] Implement `setThreadFlair` mutation
- [ ] Implement `createPostFlair` mutation (admin)
- [ ] Implement `getUserFlair` query
- [ ] Implement `setUserFlair` mutation
- [ ] Create `TagInput` component
- [ ] Create `FlairSelector` component
- [ ] Create `FlairBadge` component
- [ ] Create `UserFlair` component
- [ ] Update discussion form to include tags and flair
- [ ] Update discussion card to show tags and flair
- [ ] Add flair customization to account settings
- [ ] Create admin flair management page
- [ ] Add tag filtering to search
- [ ] Add popular tags widget to sidebar
- [ ] Test tag autocomplete
- [ ] Test flair application
- [ ] Test user flair display
