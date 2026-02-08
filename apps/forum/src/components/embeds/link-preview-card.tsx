'use client';

import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkPreviewCardProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
  className?: string;
}

/**
 * LinkPreviewCard — Renders an Open Graph preview card for a URL.
 *
 * Displays domain, title, description, and OG image in a compact card.
 * Uses metadata passed in from the thread data (pre-fetched at creation time).
 */
export function LinkPreviewCard({
  url,
  title,
  description,
  image,
  domain,
  className,
}: LinkPreviewCardProps) {
  const displayDomain = domain ?? getDomain(url);
  const displayTitle = title ?? url;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors group",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {image && (
          <div className="sm:w-48 shrink-0 bg-muted">
            <img
              src={image}
              alt=""
              className="w-full h-32 sm:h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{displayDomain}</span>
          </div>
          <h4 className="font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors">
            {displayTitle}
          </h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}
