'use client';

import { detectEmbed } from '@/lib/embed-detector';
import { YouTubeEmbed, VimeoEmbed, SpotifyEmbed } from './media-embeds';
import { LinkPreviewCard } from './link-preview-card';

interface EmbedRendererProps {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  domain?: string | null;
}

/**
 * EmbedRenderer — Detects the URL type and renders the appropriate embed.
 *
 * Supports: YouTube (lazy-load player), Vimeo, Spotify, and generic link previews.
 * Falls back to a LinkPreviewCard for unrecognized URLs.
 */
export function EmbedRenderer({
  url,
  title,
  description,
  image,
  domain,
}: EmbedRendererProps) {
  const embedInfo = detectEmbed(url);

  if (!embedInfo) {
    return (
      <LinkPreviewCard
        url={url}
        title={title}
        description={description}
        image={image}
        domain={domain}
      />
    );
  }

  switch (embedInfo.type) {
    case "youtube":
      return (
        <YouTubeEmbed
          embedUrl={embedInfo.embedUrl}
          originalUrl={embedInfo.originalUrl}
          title={title ?? undefined}
        />
      );
    case "vimeo":
      return (
        <VimeoEmbed
          embedUrl={embedInfo.embedUrl}
          originalUrl={embedInfo.originalUrl}
          title={title ?? undefined}
        />
      );
    case "spotify":
      return (
        <SpotifyEmbed
          embedUrl={embedInfo.embedUrl}
          originalUrl={embedInfo.originalUrl}
        />
      );
    case "twitter":
      // Twitter embeds require the widget.js script; fallback to link preview
      return (
        <LinkPreviewCard
          url={url}
          title={title ?? "Tweet"}
          description={description}
          image={image}
          domain="twitter.com"
        />
      );
    case "gist":
    case "codepen":
      // Gist and CodePen could use iframes but are best as link previews for security
      return (
        <LinkPreviewCard
          url={url}
          title={title}
          description={description}
          image={image}
          domain={domain}
        />
      );
    default:
      return (
        <LinkPreviewCard
          url={url}
          title={title}
          description={description}
          image={image}
          domain={domain}
        />
      );
  }
}
