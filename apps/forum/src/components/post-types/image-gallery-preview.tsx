'use client';

import { useState } from 'react';
import { cn } from '@createconomy/ui';
import { Images } from 'lucide-react';

interface ImageItem {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryPreviewProps {
  images: ImageItem[];
  compact?: boolean;
}

/**
 * ImageGalleryPreview — Grid display for image post type.
 *
 * Compact mode: shows 1–4 images in a grid with +N overlay.
 * Full mode: shows all images in a masonry-like grid.
 */
export function ImageGalleryPreview({
  images,
  compact = false,
}: ImageGalleryPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const maxShow = compact ? 4 : images.length;
  const visible = images.slice(0, maxShow);
  const remaining = images.length - maxShow;

  if (compact) {
    // Compact grid for feed cards
    if (images.length === 1) {
      return (
        <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
          <img
            src={images[0]!.url}
            alt={images[0]!.caption ?? ''}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div
        className={cn(
          'grid gap-1 rounded-lg overflow-hidden',
          images.length === 2 && 'grid-cols-2',
          images.length === 3 && 'grid-cols-2 grid-rows-2',
          images.length >= 4 && 'grid-cols-2 grid-rows-2'
        )}
      >
        {visible.map((img, i) => (
          <div
            key={i}
            className={cn(
              'relative bg-muted',
              images.length === 3 && i === 0 && 'row-span-2',
              'aspect-square first:aspect-auto'
            )}
          >
            <img
              src={img.url}
              alt={img.caption ?? ''}
              className="w-full h-full object-cover"
            />
            {i === maxShow - 1 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex items-center gap-1.5 text-white">
                  <Images className="h-5 w-5" />
                  <span className="text-lg font-bold">+{remaining}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Full gallery for thread detail
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'grid gap-2',
          images.length === 1 && 'grid-cols-1',
          images.length === 2 && 'grid-cols-2',
          images.length >= 3 && 'grid-cols-2 md:grid-cols-3'
        )}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="relative rounded-lg overflow-hidden bg-muted aspect-square hover:opacity-90 transition-opacity"
          >
            <img
              src={img.url}
              alt={img.caption ?? `Image ${i + 1}`}
              className="w-full h-full object-cover"
            />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white line-clamp-1">
                  {img.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:opacity-80"
            onClick={() => setSelectedIndex(null)}
          >
            ✕
          </button>
          <img
            src={images[selectedIndex]!.url}
            alt={images[selectedIndex]!.caption ?? ''}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
          {images[selectedIndex]!.caption && (
            <p className="absolute bottom-8 text-white text-sm bg-black/50 px-4 py-2 rounded">
              {images[selectedIndex]!.caption}
            </p>
          )}
          {selectedIndex > 0 && (
            <button
              className="absolute left-4 text-white text-3xl hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(selectedIndex - 1);
              }}
            >
              ‹
            </button>
          )}
          {selectedIndex < images.length - 1 && (
            <button
              className="absolute right-4 text-white text-3xl hover:opacity-80"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(selectedIndex + 1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
