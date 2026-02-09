'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
  embedUrl: string;
  originalUrl: string;
  title?: string;
}

/**
 * YouTubeEmbed — Lazy-loading YouTube video player.
 *
 * Shows a thumbnail with a play button first; loads the actual iframe
 * on click to avoid loading overhead for off-screen embeds.
 */
export function YouTubeEmbed({ embedUrl, title }: YouTubeEmbedProps) {
  const [showPlayer, setShowPlayer] = useState(false);

  // Extract video ID from embed URL
  const videoId = embedUrl.split("/").pop()?.split("?")[0];
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      {showPlayer ? (
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={title ?? "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button
          onClick={() => setShowPlayer(true)}
          className="relative w-full h-full group cursor-pointer"
          aria-label="Play video"
        >
          <img
            src={thumbnailUrl}
            alt={title ?? "Video thumbnail"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

interface VimeoEmbedProps {
  embedUrl: string;
  originalUrl: string;
  title?: string;
}

/**
 * VimeoEmbed — Vimeo video player embed.
 */
export function VimeoEmbed({ embedUrl, title }: VimeoEmbedProps) {
  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={title ?? "Vimeo video"}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

interface SpotifyEmbedProps {
  embedUrl: string;
  originalUrl: string;
}

/**
 * SpotifyEmbed — Spotify embedded player.
 */
export function SpotifyEmbed({ embedUrl }: SpotifyEmbedProps) {
  return (
    <div className="rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        width="100%"
        height="352"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  );
}
