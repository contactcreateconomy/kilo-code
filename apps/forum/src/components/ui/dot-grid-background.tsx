'use client';

import { cn } from '@/lib/utils';

interface DotGridBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DotGridBackground - Full-page dot grid pattern with fade-center mask
 * Provides the premium background effect for the forum redesign
 */
export function DotGridBackground({ children, className }: DotGridBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Dot Grid Pattern */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle, var(--dot-color) var(--dot-size), transparent var(--dot-size))`,
          backgroundSize: 'var(--dot-spacing) var(--dot-spacing)',
        }}
      />
      {/* Fade Center Mask */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 70%)',
        }}
      />
      {children}
    </div>
  );
}
