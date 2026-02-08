'use client';

import { ExternalLink } from 'lucide-react';

interface LinkPreviewCardProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
  compact?: boolean;
}

/**
 * LinkPreviewCard — Shows a clickable link preview with OG metadata.
 *
 * Renders a card with optional OG image, title, description, and domain.
 * Used in both feed cards (compact) and thread detail (full).
 */
export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  domain,
  compact = false,
}: LinkPreviewCardProps) {
  const displayDomain =
    domain ?? (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } })();

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 hover:bg-accent/50 transition-colors group"
      >
        {image && (
          <img
            src={image}
            alt=""
            className="h-16 w-16 rounded object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {title ?? url}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            <span>{displayDomain}</span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-colors group"
    >
      {image && (
        <div className="relative w-full aspect-video bg-muted">
          <img
            src={image}
            alt={title ?? ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <p className="font-medium group-hover:text-primary transition-colors line-clamp-2">
          {title ?? url}
        </p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
            {description}
          </p>
        )}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          <span>{displayDomain}</span>
        </div>
      </div>
    </a>
  );
}
