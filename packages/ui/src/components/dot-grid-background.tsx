'use client';

import { cn } from '@/lib/utils';

interface DotGridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DotGridBackground — Full-page dot grid pattern with fade-center mask.
 *
 * Provides the premium background effect used across the platform.
 * The CSS for `.dot-grid-background` is defined in the shared globals.css.
 * This component version allows programmatic usage with className merging.
 */
export function DotGridBackground({ children, className }: DotGridBackgroundProps) {
  return (
    <div className={cn('dot-grid-background', className)}>
      {children}
    </div>
  );
}
