# Phase 09 — Link Previews & Media Embeds

> **Priority:** 🟡 Medium  
> **Depends on:** Phase 03 (Link post type)  
> **Enables:** Better content presentation, embedded media playback

## Problem

Currently users can paste URLs in posts, but there's no automatic preview generation. Users see raw links instead of rich preview cards. Additionally, embedded videos from YouTube, Vimeo, and tweets from Twitter/X are not rendered inline.

## Goal

Automatically generate Open Graph preview cards for links and render embedded media (YouTube, Twitter, etc.) inline.

---

## Supported Embeds

| Platform | URL Pattern | Embed Type |
|----------|------------|------------|
| YouTube | youtube.com/watch, youtu.be | iframe player |
| Vimeo | vimeo.com | iframe player |
| Twitter/X | twitter.com, x.com | oEmbed card |
| Spotify | open.spotify.com | iframe player |
| GitHub Gist | gist.github.com | iframe |
| CodePen | codepen.io | iframe |
| Generic URL | Any other URL | OG metadata card |

---

## Backend Changes

### File: `packages/convex/convex/lib/og-scraper.ts`

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";

export interface OGMetadata {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  domain: string;
  type: "website" | "article" | "video" | "music";
}

export const scrapeUrl = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<OGMetadata> => {
    try {
      const response = await fetch(args.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Createconomy/1.0)",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch URL");
      }
      
      const html = await response.text();
      const metadata = parseOGTags(html, args.url);
      
      return metadata;
    } catch (error) {
      // Return minimal metadata on failure
      return {
        url: args.url,
        title: args.url,
        description: "",
        image: null,
        siteName: null,
        domain: new URL(args.url).hostname,
        type: "website",
      };
    }
  },
});

function parseOGTags(html: string, url: string): OGMetadata {
  // Simple regex-based parsing (could use cheerio for production)
  const getMetaContent = (property: string): string | null => {
    const regex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      "i"
    );
    const match = html.match(regex);
    return match?.[1] ?? null;
  };
  
  const getTitle = (): string => {
    const ogTitle = getMetaContent("og:title");
    if (ogTitle) return ogTitle;
    
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch?.[1] ?? url;
  };
  
  return {
    url,
    title: getTitle(),
    description: getMetaContent("og:description") ?? 
                 getMetaContent("description") ?? "",
    image: getMetaContent("og:image"),
    siteName: getMetaContent("og:site_name"),
    domain: new URL(url).hostname.replace("www.", ""),
    type: (getMetaContent("og:type") as OGMetadata["type"]) ?? "website",
  };
}
```

### File: `packages/convex/convex/lib/embed-detector.ts`

```typescript
export interface EmbedInfo {
  type: "youtube" | "vimeo" | "twitter" | "spotify" | "gist" | "codepen" | "generic";
  embedUrl: string;
  originalUrl: string;
  aspectRatio?: string; // e.g., "16/9"
}

export function detectEmbed(url: string): EmbedInfo | null {
  const urlObj = new URL(url);
  const host = urlObj.hostname.replace("www.", "");
  
  // YouTube
  if (host === "youtube.com" || host === "youtu.be") {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return {
        type: "youtube",
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        originalUrl: url,
        aspectRatio: "16/9",
      };
    }
  }
  
  // Vimeo
  if (host === "vimeo.com") {
    const videoId = urlObj.pathname.split("/")[1];
    if (videoId && /^\d+$/.test(videoId)) {
      return {
        type: "vimeo",
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
        originalUrl: url,
        aspectRatio: "16/9",
      };
    }
  }
  
  // Twitter/X
  if (host === "twitter.com" || host === "x.com") {
    const match = urlObj.pathname.match(/\/\w+\/status\/(\d+)/);
    if (match) {
      return {
        type: "twitter",
        embedUrl: url,
        originalUrl: url,
      };
    }
  }
  
  // Spotify
  if (host === "open.spotify.com") {
    const embedUrl = url.replace("open.spotify.com", "open.spotify.com/embed");
    return {
      type: "spotify",
      embedUrl,
      originalUrl: url,
    };
  }
  
  // GitHub Gist
  if (host === "gist.github.com") {
    return {
      type: "gist",
      embedUrl: `${url}.js`,
      originalUrl: url,
    };
  }
  
  return null;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&]+)/,                    // youtube.com/watch?v=ID
    /youtu\.be\/([^?&]+)/,              // youtu.be/ID
    /youtube\.com\/embed\/([^?&]+)/,    // youtube.com/embed/ID
    /youtube\.com\/shorts\/([^?&]+)/,   // youtube.com/shorts/ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}
```

---

## Frontend Components

### 1. Link Preview Card

#### `apps/forum/src/components/embeds/link-preview-card.tsx`

```typescript
interface LinkPreviewCardProps {
  url: string;
  title?: string;
  description?: string;
  image?: string | null;
  domain?: string;
  className?: string;
}

export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  domain,
  className,
}: LinkPreviewCardProps) {
  // Fallback to fetching metadata if not provided
  const { metadata, isLoading } = useLinkPreview(url, { 
    skip: !!(title && domain),
  });
  
  const displayTitle = title ?? metadata?.title ?? url;
  const displayDescription = description ?? metadata?.description;
  const displayImage = image ?? metadata?.image;
  const displayDomain = domain ?? metadata?.domain ?? new URL(url).hostname;
  
  if (isLoading) {
    return <LinkPreviewSkeleton />;
  }
  
  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors",
        className
      )}
    >
      <div className="flex">
        {/* Image */}
        {displayImage && (
          <div className="w-32 shrink-0">
            <img 
              src={displayImage} 
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 p-3">
          <p className="text-xs text-muted-foreground mb-1">
            {displayDomain}
          </p>
          <h4 className="font-medium line-clamp-2 text-sm">
            {displayTitle}
          </h4>
          {displayDescription && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {displayDescription}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
```

### 2. YouTube Embed

#### `apps/forum/src/components/embeds/youtube-embed.tsx`

```typescript
interface YouTubeEmbedProps {
  embedUrl: string;
  originalUrl: string;
  title?: string;
}

export function YouTubeEmbed({ embedUrl, originalUrl, title }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  
  // Lazy load: show thumbnail first, load iframe on click
  const videoId = embedUrl.split("/").pop();
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      {showPlayer ? (
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={title ?? "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          onLoad={() => setIsLoaded(true)}
        />
      ) : (
        <button
          onClick={() => setShowPlayer(true)}
          className="relative w-full h-full group"
        >
          <img 
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
```

### 3. Twitter Embed

#### `apps/forum/src/components/embeds/twitter-embed.tsx`

```typescript
import { useEffect, useRef, useState } from 'react';

interface TwitterEmbedProps {
  url: string;
}

export function TwitterEmbed({ url }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Load Twitter widget script
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        window.twttr?.widgets?.load(containerRef.current);
        setIsLoaded(true);
      };
    } else {
      window.twttr.widgets.load(containerRef.current);
      setIsLoaded(true);
    }
  }, [url]);
  
  return (
    <div ref={containerRef} className="max-w-lg">
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
}
```

### 4. Generic Embed Renderer

#### `apps/forum/src/components/embeds/embed-renderer.tsx`

```typescript
import { detectEmbed, EmbedInfo } from '@/lib/embed-detector';
import { YouTubeEmbed } from './youtube-embed';
import { TwitterEmbed } from './twitter-embed';
import { SpotifyEmbed } from './spotify-embed';
import { LinkPreviewCard } from './link-preview-card';

interface EmbedRendererProps {
  url: string;
  metadata?: OGMetadata;
}

export function EmbedRenderer({ url, metadata }: EmbedRendererProps) {
  const embedInfo = detectEmbed(url);
  
  if (!embedInfo) {
    return <LinkPreviewCard url={url} {...metadata} />;
  }
  
  switch (embedInfo.type) {
    case 'youtube':
      return <YouTubeEmbed {...embedInfo} />;
    case 'vimeo':
      return <VimeoEmbed {...embedInfo} />;
    case 'twitter':
      return <TwitterEmbed url={url} />;
    case 'spotify':
      return <SpotifyEmbed {...embedInfo} />;
    case 'gist':
      return <GistEmbed {...embedInfo} />;
    default:
      return <LinkPreviewCard url={url} {...metadata} />;
  }
}
```

---

## Integration Points

### 1. Thread Detail Page

For link posts, render the embed in the thread header:

```typescript
// apps/forum/src/app/t/[id]/page.tsx
{thread.postType === 'link' && thread.linkUrl && (
  <div className="mb-6">
    <EmbedRenderer 
      url={thread.linkUrl}
      metadata={{
        title: thread.linkTitle,
        description: thread.linkDescription,
        image: thread.linkImage,
        domain: thread.linkDomain,
      }}
    />
  </div>
)}
```

### 2. Feed Cards

Show embed preview in feed cards for link posts:

```typescript
// apps/forum/src/components/feed/discussion-card.tsx
{discussion.postType === 'link' && (
  <div className="mt-3">
    <EmbedRenderer 
      url={discussion.linkUrl}
      metadata={{
        title: discussion.linkTitle,
        description: discussion.linkDescription,
        image: discussion.linkImage,
        domain: discussion.linkDomain,
      }}
    />
  </div>
)}
```

### 3. Rich Text Content

Parse URLs in post/comment content and render embeds:

```typescript
// apps/forum/src/components/content/rich-content.tsx
export function RichContent({ html }: { html: string }) {
  // Extract URLs from content
  const urls = extractUrls(html);
  const embeddableUrls = urls.filter(url => detectEmbed(url));
  
  return (
    <div>
      {/* Render markdown/HTML content */}
      <div 
        className="prose prose-sm dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      
      {/* Render embeds for detected URLs */}
      {embeddableUrls.map(url => (
        <div key={url} className="mt-4">
          <EmbedRenderer url={url} />
        </div>
      ))}
    </div>
  );
}
```

---

## Caching Strategy

### Cache OG Metadata

Store fetched metadata to avoid re-scraping:

```typescript
// packages/convex/convex/schema.ts
urlMetadataCache: defineTable({
  url: v.string(),
  urlHash: v.string(),  // SHA-256 hash of URL
  title: v.string(),
  description: v.string(),
  image: v.optional(v.string()),
  domain: v.string(),
  fetchedAt: v.number(),
  expiresAt: v.number(),  // Cache for 7 days
})
  .index("by_hash", ["urlHash"])
```

```typescript
// Check cache before scraping
export const getUrlMetadata = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const urlHash = await hashUrl(args.url);
    
    const cached = await ctx.db
      .query("urlMetadataCache")
      .withIndex("by_hash", (q) => q.eq("urlHash", urlHash))
      .first();
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached;
    }
    
    return null;
  },
});
```

---

## Security Considerations

1. **Sanitize URLs** — Validate URLs before fetching
2. **CSP Headers** — Allow iframes only from trusted sources
3. **XSS Prevention** — Sanitize any user-provided metadata
4. **Rate Limiting** — Limit URL scraping to prevent abuse
5. **Timeout** — Set fetch timeout for slow/hanging URLs

---

## Implementation Checklist

- [ ] Create `og-scraper.ts` action for fetching OG metadata
- [ ] Create `embed-detector.ts` utility
- [ ] Create `urlMetadataCache` table for caching
- [ ] Create `LinkPreviewCard` component
- [ ] Create `YouTubeEmbed` component with lazy loading
- [ ] Create `VimeoEmbed` component
- [ ] Create `TwitterEmbed` component with widget loading
- [ ] Create `SpotifyEmbed` component
- [ ] Create `GistEmbed` component
- [ ] Create `EmbedRenderer` wrapper component
- [ ] Create `useLinkPreview` hook for client-side fetching
- [ ] Integrate embeds in thread detail page
- [ ] Integrate embeds in feed cards
- [ ] Integrate embeds in rich text content
- [ ] Add loading skeletons for embeds
- [ ] Implement URL metadata caching
- [ ] Add CSP headers for iframe sources
- [ ] Add fallback for failed embeds
- [ ] Test all embed types
- [ ] Test mobile responsiveness
