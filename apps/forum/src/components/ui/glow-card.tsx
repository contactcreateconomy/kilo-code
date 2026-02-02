'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

/**
 * GlowCard - Card with hover glow effect and lift animation
 */
export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, children, hover = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-xl border bg-card p-4 transition-all duration-200',
          hover && 'hover:border-primary/50 hover:shadow-glow-sm',
          className
        )}
        whileHover={hover ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlowCard.displayName = 'GlowCard';
