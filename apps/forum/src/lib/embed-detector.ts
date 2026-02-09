/**
 * Embed detection utility
 *
 * Detects embeddable media from URLs (YouTube, Vimeo, Twitter/X, Spotify, etc.)
 * and returns the appropriate embed URL and type.
 *
 * @see Phase 09 plan — plans/forum-reddit-enhancements/phase-09-link-previews.md
 */

export interface EmbedInfo {
  type: "youtube" | "vimeo" | "twitter" | "spotify" | "gist" | "codepen" | "generic";
  embedUrl: string;
  originalUrl: string;
  aspectRatio?: string; // e.g., "16/9"
}

/**
 * Detect if a URL is embeddable and return embed info.
 *
 * @param url - URL to check
 * @returns EmbedInfo or null if not embeddable
 */
export function detectEmbed(url: string): EmbedInfo | null {
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return null;
  }

  const host = urlObj.hostname.replace("www.", "");

  // YouTube
  if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
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

  // CodePen
  if (host === "codepen.io") {
    const parts = urlObj.pathname.split("/");
    if (parts.length >= 4 && parts[2] === "pen") {
      const user = parts[1];
      const penId = parts[3];
      return {
        type: "codepen",
        embedUrl: `https://codepen.io/${user}/embed/${penId}?default-tab=result`,
        originalUrl: url,
        aspectRatio: "16/9",
      };
    }
  }

  return null;
}

/**
 * Extract YouTube video ID from various URL formats.
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/, // youtube.com/watch?v=ID
    /youtu\.be\/([^?&#]+)/, // youtu.be/ID
    /youtube\.com\/embed\/([^?&#]+)/, // youtube.com/embed/ID
    /youtube\.com\/shorts\/([^?&#]+)/, // youtube.com/shorts/ID
    /youtube\.com\/live\/([^?&#]+)/, // youtube.com/live/ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

/**
 * Extract URLs from HTML content string.
 *
 * @param content - HTML or plain text content
 * @returns Array of unique URLs found
 */
export function extractUrls(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  const matches = content.match(urlRegex);
  if (!matches) return [];
  return [...new Set(matches)];
}
