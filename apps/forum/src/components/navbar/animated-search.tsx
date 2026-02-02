'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * AnimatedSearch - Expandable search bar with smooth animation
 * Expands from icon-only (40px) to full search bar (320px)
 */
export function AnimatedSearch() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    if (!query) {
      setIsExpanded(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ width: isExpanded ? 320 : 40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <form onSubmit={handleSubmit}>
        <motion.div
          className={cn(
            'flex items-center rounded-full border transition-all',
            isExpanded 
              ? 'bg-background border-border shadow-glow-sm' 
              : 'bg-transparent border-transparent hover:bg-accent cursor-pointer'
          )}
          onClick={!isExpanded ? handleExpand : undefined}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center w-10 h-10">
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input Field */}
          <AnimatePresence>
            {isExpanded && (
              <motion.input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onBlur={handleCollapse}
                placeholder="Search discussions..."
                className="flex-1 bg-transparent border-none outline-none text-sm pr-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </form>
    </motion.div>
  );
}
