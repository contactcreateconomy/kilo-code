'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Discussion } from '@/types/forum';

interface FeaturedSliderProps {
  discussions: Discussion[];
}

/**
 * FeaturedSlider - Horizontal carousel with featured posts
 */
export function FeaturedSlider({ discussions }: FeaturedSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (discussions.length === 0) return null;

  return (
    <div className="relative group">
      {/* Carousel Container */}
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex">
          {discussions.map((discussion, index) => (
            <div
              key={discussion.id}
              className="flex-[0_0_100%] min-w-0 pl-0 first:pl-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <motion.div
                className="mx-2 first:ml-0 last:mr-0"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <FeaturedCard discussion={discussion} />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 z-10',
          'w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm',
          'flex items-center justify-center',
          'border shadow-lg',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-background disabled:opacity-50'
        )}
        disabled={!canScrollPrev}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 z-10',
          'w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm',
          'flex items-center justify-center',
          'border shadow-lg',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-background disabled:opacity-50'
        )}
        disabled={!canScrollNext}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {discussions.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index === selectedIndex
                ? 'bg-primary w-6'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface FeaturedCardProps {
  discussion: Discussion;
}

function FeaturedCard({ discussion }: FeaturedCardProps) {
  return (
    <a
      href={`/t/${discussion.id}`}
      className="block relative h-[280px] rounded-xl overflow-hidden group/card"
    >
      {/* Background Image or Gradient */}
      {discussion.imageUrl ? (
        <Image
          src={discussion.imageUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover/card:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        {/* Category Badge */}
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/80 backdrop-blur-sm text-white text-xs rounded-full w-fit mb-3">
          {discussion.category.icon} {discussion.category.name}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover/card:text-primary transition-colors">
          {discussion.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-white/80 line-clamp-2 mb-3">
          {discussion.summary}
        </p>

        {/* Author & Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={discussion.author.avatarUrl}
              alt={discussion.author.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-white/90">{discussion.author.name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span>↑ {discussion.upvotes}</span>
            <span>💬 {discussion.comments}</span>
          </div>
        </div>
      </div>

      {/* Pinned Badge */}
      {discussion.isPinned && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/90 text-black text-xs font-medium rounded-full">
          📌 Pinned
        </div>
      )}
    </a>
  );
}
